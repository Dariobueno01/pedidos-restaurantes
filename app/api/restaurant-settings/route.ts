import { NextResponse } from "next/server";

import { db } from "@/src/lib/db";

import { createSupabaseServerClient } from "@/src/lib/supabase-server-auth";

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
      where: {
        id: authUser.id,
      },
      include: {
        restaurant: true,
      },
    });

    if (!user || user.role !== "RESTAURANT_ADMIN") {
      return NextResponse.json(
        { error: "No autorizado." },
        { status: 403 }
      );
    }

    if (!user.restaurant) {
      return NextResponse.json(
        { error: "No tienes un restaurante asignado." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const address =
      typeof body.address === "string"
        ? body.address.trim() || null
        : null;

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim() || null
        : null;

    const minimumOrder =
      body.minimumOrder === null ||
      body.minimumOrder === undefined ||
      body.minimumOrder === ""
        ? null
        : Number(body.minimumOrder);

    const deliveryFee =
      body.deliveryFee === null ||
      body.deliveryFee === undefined ||
      body.deliveryFee === ""
        ? null
        : Number(body.deliveryFee);

    const isOpen =
      typeof body.isOpen === "boolean"
        ? body.isOpen
        : user.restaurant.isOpen;

    const openingTime =
      typeof body.openingTime === "string"
        ? body.openingTime.trim() || null
        : null;

    const closingTime =
      typeof body.closingTime === "string"
        ? body.closingTime.trim() || null
        : null;

    if (
      minimumOrder !== null &&
      (!Number.isFinite(minimumOrder) || minimumOrder < 0)
    ) {
      return NextResponse.json(
        { error: "El pedido mínimo no es válido." },
        { status: 400 }
      );
    }

    if (
      deliveryFee !== null &&
      (!Number.isFinite(deliveryFee) || deliveryFee < 0)
    ) {
      return NextResponse.json(
        { error: "El coste de envío no es válido." },
        { status: 400 }
      );
    }

    const restaurant = await db.restaurant.update({
      where: {
        id: user.restaurant.id,
      },
      data: {
        address,
        phone,
        minimumOrder,
        deliveryFee,
        isOpen,
        openingTime,
        closingTime,
      },
    });

    return NextResponse.json({
      success: true,
      restaurant: {
        id: restaurant.id,
        address: restaurant.address,
        phone: restaurant.phone,
        minimumOrder: restaurant.minimumOrder
          ? Number(restaurant.minimumOrder)
          : null,
        deliveryFee: restaurant.deliveryFee
          ? Number(restaurant.deliveryFee)
          : null,
        isOpen: restaurant.isOpen,
        openingTime: restaurant.openingTime,
        closingTime: restaurant.closingTime,
      },
    });
  } catch (error) {
    console.error("Error actualizando configuración:", error);

    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
