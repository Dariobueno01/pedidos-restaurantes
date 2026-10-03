import { NextResponse } from "next/server";

import { db } from "@/src/lib/db";

import { supabaseServer } from "@/src/lib/supabase-server";

import { createSupabaseServerClient } from "@/src/lib/supabase-server-auth";

export async function POST(request: Request) {
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

    if (
      !user ||
      (user.role !== "SUPER_ADMIN" &&
        user.role !== "RESTAURANT_ADMIN")
    ) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const formData = await request.formData();

    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No se recibió ninguna imagen." },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "El archivo debe ser una imagen." },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "La imagen no puede superar los 5 MB." },
        { status: 400 }
      );
    }

    const extension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    const fileName = `${crypto.randomUUID()}.${extension}`;

    const arrayBuffer = await file.arrayBuffer();

    const buffer = new Uint8Array(arrayBuffer);

    const { error } = await supabaseServer.storage
      .from("product-images")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("ERROR STORAGE:", error);

      return NextResponse.json(
        { error: "No se pudo subir la imagen." },
        { status: 500 }
      );
    }

    const { data } = supabaseServer.storage
      .from("product-images")
      .getPublicUrl(fileName);

    return NextResponse.json({
      url: data.publicUrl,
    });
  } catch (error) {
    console.error("ERROR UPLOAD:", error);

    return NextResponse.json(
      { error: "Error interno al subir la imagen." },
      { status: 500 }
    );
  }
}
