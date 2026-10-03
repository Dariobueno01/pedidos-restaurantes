import { NextResponse } from "next/server";

import { db } from "@/src/lib/db";
import { isRestaurantCurrentlyOpen } from "@/src/lib/restaurant-hours";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      restaurantSlug,
      customerName,
      customerPhone,
      address,
      notes,
      orderType,
      paymentMethod,
      items,
    } = body;

    if (
      !restaurantSlug ||
      !customerName ||
      !customerPhone ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: "Datos del pedido incompletos" },
        { status: 400 }
      );
    }

    if (customerName.length > 100 || customerPhone.length > 30 || (address && address.length > 250) || (notes && notes.length > 500) || items.length > 50) {
      return NextResponse.json(
        { error: "Los datos del pedido superan los límites permitidos." },
        { status: 400 }
      );
    }

    if (orderType !== "DELIVERY" && orderType !== "PICKUP") {
      return NextResponse.json(
        { error: "Tipo de pedido no válido." },
        { status: 400 }
      );
    }

    if (paymentMethod !== "CASH") {
      return NextResponse.json(
        { error: "Método de pago no válido." },
        { status: 400 }
      );
    }

    if (orderType === "DELIVERY" && !address) {
      return NextResponse.json(
        { error: "La dirección de entrega es obligatoria." },
        { status: 400 }
      );
    }

    const restaurant = await db.restaurant.findUnique({
      where: {
        slug: restaurantSlug,
      },
    });

    if (!restaurant || !restaurant.isActive) {
      return NextResponse.json(
        { error: "Restaurante no encontrado" },
        { status: 404 }
      );
    }

    const currentlyOpen = isRestaurantCurrentlyOpen({
      isOpen: restaurant.isOpen,
      openingTime: restaurant.openingTime,
      closingTime: restaurant.closingTime,
    });

    if (!currentlyOpen) {
      return NextResponse.json(
        { error: "El restaurante está cerrado y no acepta pedidos." },
        { status: 403 }
      );
    }

    if (orderType === "DELIVERY" && restaurant.deliveryFee === null) {
      return NextResponse.json(
        { error: "Este restaurante no ofrece entrega a domicilio." },
        { status: 400 }
      );
    }

    const invalidItems = items.some(
      (item: unknown) =>
        !item ||
        typeof item !== "object" ||
        typeof (item as { id?: unknown }).id !== "string" ||
        !(item as { id: string }).id.trim() ||
        !Number.isInteger((item as { quantity?: unknown }).quantity) ||
        (item as { quantity: number }).quantity <= 0
    );

    if (invalidItems) {
      return NextResponse.json(
        { error: "Los productos del pedido no son válidos." },
        { status: 400 }
      );
    }

    const productIds = items.map(
      (item: { id: string }) => item.id
    );

    const products = await db.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        isAvailable: true,
        category: {
          restaurantId: restaurant.id,
        },
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        {
          error:
            "Uno o más productos no pertenecen a este restaurante",
        },
        { status: 400 }
      );
    }

    const orderItems = items.map(
      (item: { id: string; quantity: number }) => {
        const product = products.find(
          (product) => product.id === item.id
        );

        if (!product) {
          throw new Error("Producto no encontrado");
        }

        const quantity = Number(item.quantity);

        if (!Number.isInteger(quantity) || quantity <= 0) {
          throw new Error("Cantidad de producto inválida");
        }

        return {
          productId: product.id,
          productName: product.name,
          unitPrice: product.price,
          quantity,
        };
      }
    );

    const subtotal = orderItems.reduce(
      (sum, item) =>
        sum + Number(item.unitPrice) * item.quantity,
      0
    );

    const minimumOrder =
      restaurant.minimumOrder !== null
        ? Number(restaurant.minimumOrder)
        : null;

    if (minimumOrder !== null && subtotal < minimumOrder) {
      return NextResponse.json(
        {
          error: `El pedido mínimo es de ${minimumOrder.toFixed(2)} €. Tu pedido tiene ${subtotal.toFixed(2)} €.`,
        },
        { status: 400 }
      );
    }

    const deliveryFee =
      orderType === "DELIVERY" && restaurant.deliveryFee !== null
        ? Number(restaurant.deliveryFee)
        : 0;

    const total = subtotal + deliveryFee;

    const order = await db.order.create({
      data: {
        restaurantId: restaurant.id,
        customerName,
        customerPhone,
        address:
          orderType === "PICKUP"
            ? "RECOGIDA EN RESTAURANTE"
            : address,
        notes: notes || null,
        orderType,
        paymentMethod,
        total,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({
      success: true,
      order,
      subtotal,
      deliveryFee,
      total,
    });
  } catch (error) {
    console.error("Error creando pedido:", error);

    return NextResponse.json(
      { error: "No se pudo crear el pedido" },
      { status: 500 }
    );
  }
}
