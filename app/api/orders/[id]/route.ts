import { NextResponse } from "next/server";
import { db } from "@/src/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Pedido no especificado." },
        { status: 400 }
      );
    }

    const order = await db.order.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        orderType: true,
        paymentMethod: true,
        total: true,
        createdAt: true,
        restaurant: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Pedido no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      order: {
        id: order.id,
        status: order.status,
        orderType: order.orderType,
        paymentMethod: order.paymentMethod,
        total: Number(order.total),
        createdAt: order.createdAt.toISOString(),
        restaurantName: order.restaurant.name,
        restaurantSlug: order.restaurant.slug,
      },
    });
  } catch (error) {
    console.error("Error consultando pedido:", error);

    return NextResponse.json(
      { error: "No se pudo consultar el pedido." },
      { status: 500 }
    );
  }
}
