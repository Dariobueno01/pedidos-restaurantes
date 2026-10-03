import { NextResponse } from "next/server";

import { db } from "@/src/lib/db";
import { createSupabaseServerClient } from "@/src/lib/supabase-server-auth";
import { supabaseServer } from "@/src/lib/supabase-server";

async function requireSuperAdmin() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return null;
  }

  const user = await db.user.findUnique({
    where: {
      id: authUser.id,
    },
  });

  if (!user || user.role !== "SUPER_ADMIN") {
    return null;
  }

  return user;
}

export async function POST(request: Request) {
  let createdRestaurantId: string | null = null;
  let createdAuthUserId: string | null = null;

  try {
    const user = await requireSuperAdmin();

    if (!user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      name,
      slug,
      adminEmail,
      adminPassword,
    } = body;

    if (!name || !slug || !adminEmail || !adminPassword) {
      return NextResponse.json(
        {
          error:
            "Nombre, slug, email y contraseña del administrador son obligatorios.",
        },
        { status: 400 }
      );
    }

    const normalizedSlug = String(slug)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const normalizedEmail = String(adminEmail)
      .trim()
      .toLowerCase();

    if (!normalizedSlug) {
      return NextResponse.json(
        { error: "El slug no es válido." },
        { status: 400 }
      );
    }

    if (String(adminPassword).length < 6) {
      return NextResponse.json(
        {
          error:
            "La contraseña del administrador debe tener al menos 6 caracteres.",
        },
        { status: 400 }
      );
    }

    const existingRestaurant = await db.restaurant.findUnique({
      where: {
        slug: normalizedSlug,
      },
    });

    if (existingRestaurant) {
      return NextResponse.json(
        { error: "Ese slug ya está utilizado." },
        { status: 409 }
      );
    }

    const existingUser = await db.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "Ya existe un usuario con ese email en la plataforma.",
        },
        { status: 409 }
      );
    }

    const restaurant = await db.restaurant.create({
      data: {
        name: String(name).trim(),
        slug: normalizedSlug,
        isActive: true,
      },
    });

    createdRestaurantId = restaurant.id;

    const {
      data: authData,
      error: authError,
    } = await supabaseServer.auth.admin.createUser({
      email: normalizedEmail,
      password: String(adminPassword),
      email_confirm: true,
    });

    if (authError || !authData.user) {
      throw new Error(
        authError?.message ||
          "No se pudo crear el usuario de Supabase."
      );
    }

    createdAuthUserId = authData.user.id;

    const restaurantAdmin = await db.user.create({
      data: {
        id: authData.user.id,
        email: normalizedEmail,
        role: "RESTAURANT_ADMIN",
        restaurantId: restaurant.id,
      },
    });

    return NextResponse.json({
      success: true,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
      },
      admin: {
        id: restaurantAdmin.id,
        email: restaurantAdmin.email,
        role: restaurantAdmin.role,
      },
    });
  } catch (error) {
    console.error("Error creando restaurante y administrador:", error);

    if (createdAuthUserId) {
      try {
        await supabaseServer.auth.admin.deleteUser(
          createdAuthUserId
        );
      } catch (cleanupError) {
        console.error(
          "Error limpiando usuario de Supabase:",
          cleanupError
        );
      }
    }

    if (createdRestaurantId) {
      try {
        await db.restaurant.delete({
          where: {
            id: createdRestaurantId,
          },
        });
      } catch (cleanupError) {
        console.error(
          "Error limpiando restaurante:",
          cleanupError
        );
      }
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo crear el restaurante.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireSuperAdmin();

    if (!user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const { id, name, slug, isActive } = body;

    if (!id || !name || !slug) {
      return NextResponse.json(
        { error: "ID, nombre y slug son obligatorios" },
        { status: 400 }
      );
    }

    const normalizedSlug = String(slug)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const existingRestaurant = await db.restaurant.findFirst({
      where: {
        slug: normalizedSlug,
        NOT: {
          id,
        },
      },
    });

    if (existingRestaurant) {
      return NextResponse.json(
        {
          error:
            "Ese slug ya está utilizado por otro restaurante",
        },
        { status: 409 }
      );
    }

    const restaurant = await db.restaurant.update({
      where: {
        id,
      },
      data: {
        name: String(name).trim(),
        slug: normalizedSlug,
        isActive: Boolean(isActive),
      },
    });

    return NextResponse.json({
      success: true,
      restaurant,
    });
  } catch (error) {
    console.error("Error editando restaurante:", error);

    return NextResponse.json(
      { error: "No se pudo editar el restaurante" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireSuperAdmin();

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
        { error: "ID del restaurante obligatorio" },
        { status: 400 }
      );
    }

    const restaurant = await db.restaurant.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            categories: true,
            orders: true,
          },
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurante no encontrado" },
        { status: 404 }
      );
    }

    if (
      restaurant._count.categories > 0 ||
      restaurant._count.orders > 0
    ) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar este restaurante porque tiene categorías o pedidos asociados.",
        },
        { status: 409 }
      );
    }

    await db.restaurant.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error eliminando restaurante:", error);

    return NextResponse.json(
      { error: "No se pudo eliminar el restaurante" },
      { status: 500 }
    );
  }
}


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { error: "Slug del restaurante obligatorio." },
        { status: 400 }
      );
    }

    const restaurant = await db.restaurant.findUnique({
      where: {
        slug,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        address: true,
        phone: true,
        minimumOrder: true,
        deliveryFee: true,
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurante no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      restaurant: {
        ...restaurant,
        minimumOrder:
          restaurant.minimumOrder !== null
            ? Number(restaurant.minimumOrder)
            : null,
        deliveryFee:
          restaurant.deliveryFee !== null
            ? Number(restaurant.deliveryFee)
            : null,
      },
    });
  } catch (error) {
    console.error("Error obteniendo restaurante:", error);

    return NextResponse.json(
      { error: "No se pudo obtener el restaurante." },
      { status: 500 }
    );
  }
}

