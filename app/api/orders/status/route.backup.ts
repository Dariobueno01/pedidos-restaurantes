import { NextResponse } from "next/server";

import { db } from "@/src/lib/db";
import { createSupabaseServerClient } from "@/src/lib/supabase-server-auth";

const allowedStatuses = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

export async function PATCH(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: {
        id: authUser.id,
      },
    });

    if (!user || user.role !== "RESTAURANT_ADMIN" || !user.restaurantId) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Faltan datos" },
        { status: 400 }
      );
    }

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Estado no válido" },
        { status: 400 }
      );
    }

    const order = await db.order.findFirst({
      where: {
        id: orderId,
        restaurantId: user.restaurantId,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    const updatedOrder = await db.order.update({
      where: {
        id: order.id,
      },
      data: {
        status,
      },
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error actualizando pedido:", error);

    return NextResponse.json(
      { error: "No se pudo actualizar el pedido" },
      { status: 500 }
    );
  }
}
