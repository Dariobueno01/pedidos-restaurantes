import { NextResponse } from "next/server";
import { db } from "@/src/lib/db";
import { createSupabaseServerClient } from "@/src/lib/supabase-server-auth";

async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  return db.user.findUnique({
    where: { id: authUser.id },
    include: { restaurant: true },
  });
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autorizado." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { restaurantSlug, name } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "El nombre es obligatorio." },
        { status: 400 }
      );
    }

    let restaurantId: string | null = null;

    if (user.role === "RESTAURANT_ADMIN") {
      if (!user.restaurantId) {
        return NextResponse.json(
          { error: "El usuario no tiene restaurante asignado." },
          { status: 400 }
        );
      }

      restaurantId = user.restaurantId;
    } else if (user.role === "SUPER_ADMIN") {
      if (!restaurantSlug) {
        return NextResponse.json(
          { error: "Falta el restaurante." },
          { status: 400 }
        );
      }

      const restaurant = await db.restaurant.findUnique({
        where: { slug: restaurantSlug },
      });

      if (!restaurant) {
        return NextResponse.json(
          { error: "Restaurante no encontrado." },
          { status: 404 }
        );
      }

      restaurantId = restaurant.id;
    } else {
      return NextResponse.json(
        { error: "No tienes permisos." },
        { status: 403 }
      );
    }

    const category = await db.category.create({
      data: {
        name: name.trim(),
        restaurantId,
      },
    });

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error("Error creando categoría:", error);

    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autorizado." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, name } = body;

    if (!id || !name?.trim()) {
      return NextResponse.json(
        { error: "Datos incompletos." },
        { status: 400 }
      );
    }

    const category = await db.category.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Categoría no encontrada." },
        { status: 404 }
      );
    }

    if (
      user.role !== "SUPER_ADMIN" &&
      user.restaurantId !== category.restaurantId
    ) {
      return NextResponse.json(
        { error: "No tienes permiso para modificar esta categoría." },
        { status: 403 }
      );
    }

    const updatedCategory = await db.category.update({
      where: { id },
      data: {
        name: name.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Error editando categoría:", error);

    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autorizado." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Falta el ID de la categoría." },
        { status: 400 }
      );
    }

    const category = await db.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Categoría no encontrada." },
        { status: 404 }
      );
    }

    if (
      user.role !== "SUPER_ADMIN" &&
      user.restaurantId !== category.restaurantId
    ) {
      return NextResponse.json(
        { error: "No tienes permiso para eliminar esta categoría." },
        { status: 403 }
      );
    }

    if (category._count.products > 0) {
      return NextResponse.json(
        {
          error:
            "No puedes eliminar una categoría que tiene productos. Elimina o mueve los productos primero.",
        },
        { status: 409 }
      );
    }

    await db.category.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error eliminando categoría:", error);

    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
