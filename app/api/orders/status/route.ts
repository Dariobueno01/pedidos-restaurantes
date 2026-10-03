import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/src/lib/supabase-server-auth";
import { db } from "@/src/lib/db";

const allowedStatuses = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
] as const;

type AllowedStatus = (typeof allowedStatuses)[number];

export async function PATCH(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json(
        { error: "No autenticado." },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        role: true,
        restaurantId: true,
      },
    });

    if (!user || user.role !== "RESTAURANT_ADMIN" || !user.restaurantId) {
      return NextResponse.json(
        { error: "No tienes permisos para gestionar pedidos." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const orderId =
      typeof body.orderId === "string" ? body.orderId.trim() : "";

    const requestedStatus =
      typeof body.status === "string" ? body.status.trim() : "";

    if (!orderId || !requestedStatus) {
      return NextResponse.json(
        { error: "Pedido y estado son obligatorios." },
        { status: 400 }
      );
    }

    if (
      !allowedStatuses.includes(
        requestedStatus as AllowedStatus
      )
    ) {
      return NextResponse.json(
        { error: "Estado de pedido no válido." },
        { status: 400 }
      );
    }

    const newStatus = requestedStatus as AllowedStatus;

    const order = await db.order.findFirst({
      where: {
        id: orderId,
        restaurantId: user.restaurantId,
      },
      select: {
        id: true,
        status: true,
        orderType: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Pedido no encontrado." },
        { status: 404 }
      );
    }

    const currentStatus = order.status as AllowedStatus;

    const validTransitions: Record<
      AllowedStatus,
      AllowedStatus[]
    > = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["PREPARING"],
      PREPARING:
        order.orderType === "PICKUP"
          ? ["READY_FOR_PICKUP"]
          : ["OUT_FOR_DELIVERY"],
      READY_FOR_PICKUP: ["DELIVERED"],
      OUT_FOR_DELIVERY: ["DELIVERED"],
      DELIVERED: [],
      CANCELLED: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      return NextResponse.json(
        {
          error: `No se puede cambiar el pedido de "${currentStatus}" a "${newStatus}".`,
        },
        { status: 409 }
      );
    }

    const updatedOrder = await db.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: newStatus,
      },
      select: {
        id: true,
        status: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        updatedAt: updatedOrder.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error actualizando estado del pedido:", error);

    return NextResponse.json(
      { error: "No se pudo actualizar el estado del pedido." },
      { status: 500 }
    );
  }
}
