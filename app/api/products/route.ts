import { NextResponse } from "next/server";

import { db } from "@/src/lib/db";

import { createSupabaseServerClient } from "@/src/lib/supabase-server-auth";

async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return null;
  }

  return db.user.findUnique({
    where: {
      id: authUser.id,
    },
  });
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      categoryId,
      name,
      description,
      price,
      imageUrl,
    } = body;

    if (!categoryId || !name || price === undefined) {
      return NextResponse.json(
        { error: "Categoría, nombre y precio son obligatorios" },
        { status: 400 }
      );
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return NextResponse.json(
        { error: "El precio no es válido" },
        { status: 400 }
      );
    }

    const category = await db.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    if (
      user.role === "RESTAURANT_ADMIN" &&
      category.restaurantId !== user.restaurantId
    ) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    if (
      user.role !== "SUPER_ADMIN" &&
      user.role !== "RESTAURANT_ADMIN"
    ) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const product = await db.product.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        price: numericPrice,
        imageUrl: imageUrl?.trim() || null,
        categoryId: category.id,
        isAvailable: true,
      },
    });

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error creando producto:", error);

    return NextResponse.json(
      { error: "No se pudo crear el producto" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      id,
      name,
      description,
      price,
      isAvailable,
    } = body;

    if (!id || !name || price === undefined) {
      return NextResponse.json(
        { error: "ID, nombre y precio son obligatorios" },
        { status: 400 }
      );
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return NextResponse.json(
        { error: "El precio no es válido" },
        { status: 400 }
      );
    }

    const product = await db.product.findUnique({
      where: {
        id,
      },
      include: {
        category: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    if (
      user.role === "RESTAURANT_ADMIN" &&
      product.category.restaurantId !== user.restaurantId
    ) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    if (
      user.role !== "SUPER_ADMIN" &&
      user.role !== "RESTAURANT_ADMIN"
    ) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const updatedProduct = await db.product.update({
      where: {
        id,
      },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        price: numericPrice,
        isAvailable: Boolean(isAvailable),
      },
    });

    return NextResponse.json({
      success: true,
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error editando producto:", error);

    return NextResponse.json(
      { error: "No se pudo editar el producto" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID del producto obligatorio" },
        { status: 400 }
      );
    }

    const product = await db.product.findUnique({
      where: {
        id,
      },
      include: {
        category: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    if (
      user.role === "RESTAURANT_ADMIN" &&
      product.category.restaurantId !== user.restaurantId
    ) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    if (
      user.role !== "SUPER_ADMIN" &&
      user.role !== "RESTAURANT_ADMIN"
    ) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    await db.product.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error eliminando producto:", error);

    return NextResponse.json(
      { error: "No se pudo eliminar el producto" },
      { status: 500 }
    );
  }
}
