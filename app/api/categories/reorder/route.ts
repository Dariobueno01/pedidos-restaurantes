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
  });
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

    if (
      user.role !== "SUPER_ADMIN" &&
      user.role !== "RESTAURANT_ADMIN"
    ) {
      return NextResponse.json(
        { error: "No tienes permisos." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, direction } = body;

    if (!id || !["up", "down"].includes(direction)) {
      return NextResponse.json(
        { error: "Datos inválidos." },
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
      user.role === "RESTAURANT_ADMIN" &&
      user.restaurantId !== category.restaurantId
    ) {
      return NextResponse.json(
        { error: "No tienes permiso para modificar esta categoría." },
        { status: 403 }
      );
    }

    const categories = await db.category.findMany({
      where: {
        restaurantId: category.restaurantId,
      },
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "asc" },
      ],
    });

    const currentIndex = categories.findIndex(
      (item) => item.id === category.id
    );

    if (currentIndex === -1) {
      return NextResponse.json(
        { error: "Categoría no encontrada." },
        { status: 404 }
      );
    }

    const targetIndex =
      direction === "up"
        ? currentIndex - 1
        : currentIndex + 1;

    if (
      targetIndex < 0 ||
      targetIndex >= categories.length
    ) {
      return NextResponse.json({
        success: true,
      });
    }

    const currentCategory = categories[currentIndex];
    const targetCategory = categories[targetIndex];

    await db.$transaction([
      db.category.update({
        where: { id: currentCategory.id },
        data: {
          sortOrder: targetCategory.sortOrder,
        },
      }),
      db.category.update({
        where: { id: targetCategory.id },
        data: {
          sortOrder: currentCategory.sortOrder,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error reordenando categoría:", error);

    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
