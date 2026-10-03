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

    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado." },
        { status: 404 }
      );
    }

    if (
      user.role === "RESTAURANT_ADMIN" &&
      user.restaurantId !== product.category.restaurantId
    ) {
      return NextResponse.json(
        { error: "No tienes permiso para modificar este producto." },
        { status: 403 }
      );
    }

    const products = await db.product.findMany({
      where: {
        categoryId: product.categoryId,
      },
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "asc" },
      ],
    });

    const currentIndex = products.findIndex(
      (item) => item.id === product.id
    );

    if (currentIndex === -1) {
      return NextResponse.json(
        { error: "Producto no encontrado." },
        { status: 404 }
      );
    }

    const targetIndex =
      direction === "up"
        ? currentIndex - 1
        : currentIndex + 1;

    if (
      targetIndex < 0 ||
      targetIndex >= products.length
    ) {
      return NextResponse.json({
        success: true,
      });
    }

    const currentProduct = products[currentIndex];
    const targetProduct = products[targetIndex];

    await db.$transaction([
      db.product.update({
        where: { id: currentProduct.id },
        data: {
          sortOrder: targetProduct.sortOrder,
        },
      }),

      db.product.update({
        where: { id: targetProduct.id },
        data: {
          sortOrder: currentProduct.sortOrder,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error reordenando producto:", error);

    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
