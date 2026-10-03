import { NextResponse } from "next/server";
import { db } from "@/src/lib/db";
import { createSupabaseServerClient } from "@/src/lib/supabase-server-auth";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json(
        { error: "No autorizado." },
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
        { error: "No tienes permisos." },
        { status: 403 }
      );
    }

    const orders = await db.order.findMany({
      where: {
        restaurantId: user.restaurantId,
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      orders: orders.map((order) => ({
        id: order.id,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        address: order.address,
        notes: order.notes,
        paymentMethod: order.paymentMethod,
        status: order.status,
        total: Number(order.total),
        createdAt: order.createdAt.toISOString(),
        items: order.items.map((item) => ({
          id: item.id,
          productName: item.productName,
          unitPrice: Number(item.unitPrice),
          quantity: item.quantity,
        })),
      })),
    });
  } catch (error) {
    console.error("Error obteniendo pedidos:", error);

    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
