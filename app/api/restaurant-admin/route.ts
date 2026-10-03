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

export async function PATCH(request: Request) {
  try {
    const superAdmin = await requireSuperAdmin();

    if (!superAdmin) {
      return NextResponse.json(
        { error: "No autorizado." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      userId,
      email,
      password,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "ID del administrador obligatorio." },
        { status: 400 }
      );
    }

    if (!email && !password) {
      return NextResponse.json(
        {
          error:
            "Debes indicar un nuevo email o una nueva contraseña.",
        },
        { status: 400 }
      );
    }

    const admin = await db.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!admin || admin.role !== "RESTAURANT_ADMIN") {
      return NextResponse.json(
        { error: "Administrador no encontrado." },
        { status: 404 }
      );
    }

    if (email) {
      const normalizedEmail = String(email)
        .trim()
        .toLowerCase();

      const existingUser = await db.user.findFirst({
        where: {
          email: normalizedEmail,
          NOT: {
            id: userId,
          },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          {
            error:
              "Ese email ya está utilizado por otro usuario.",
          },
          { status: 409 }
        );
      }
    }

    if (password && String(password).length < 6) {
      return NextResponse.json(
        {
          error:
            "La contraseña debe tener al menos 6 caracteres.",
        },
        { status: 400 }
      );
    }

    const updateData: {
      email?: string;
      password?: string;
    } = {};

    if (email) {
      updateData.email = String(email)
        .trim()
        .toLowerCase();
    }

    if (password) {
      updateData.password = String(password);
    }

    const { data, error } =
      await supabaseServer.auth.admin.updateUserById(
        userId,
        updateData
      );

    if (error || !data.user) {
      return NextResponse.json(
        {
          error:
            error?.message ||
            "No se pudo actualizar el usuario de Supabase.",
        },
        { status: 500 }
      );
    }

    const updatedUser = await db.user.update({
      where: {
        id: userId,
      },
      data: {
        ...(updateData.email
          ? { email: updateData.email }
          : {}),
      },
    });

    return NextResponse.json({
      success: true,
      admin: {
        id: updatedUser.id,
        email: updatedUser.email,
      },
    });
  } catch (error) {
    console.error(
      "Error gestionando administrador:",
      error
    );

    return NextResponse.json(
      {
        error:
          "No se pudo actualizar el administrador.",
      },
      { status: 500 }
    );
  }
}
