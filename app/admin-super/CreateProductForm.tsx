"use client";

import { useState } from "react";

type Category = {
  id: string;
  name: string;
  restaurantName: string;
};

type Props = {
  categories: Category[];
};

export default function CreateProductForm({ categories }: Props) {
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const createProduct = async () => {
    if (!categoryId || !name || !price) {
      setMessage("Completa categoría, nombre y precio.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      let imageUrl = "";

      if (image) {
        const formData = new FormData();
        formData.append("file", image);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          setMessage(uploadData.error || "No se pudo subir la imagen.");
          return;
        }

        imageUrl = uploadData.url;
      }

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoryId,
          name,
          description,
          price: Number(price),
          imageUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "No se pudo crear el producto.");
        return;
      }

      setMessage("✅ Producto creado correctamente.");
      setName("");
      setDescription("");
      setPrice("");
      setImage(null);

      const fileInput = document.getElementById(
        "product-image"
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.error(error);
      setMessage("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-100 bg-zinc-50/70 px-6 py-5 sm:px-7">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500 text-xl text-white shadow-sm">
            🍔
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-red-500">
              Catálogo
            </p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-zinc-950">
              Crear producto
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Añade un producto completo al menú de un restaurante.
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 sm:px-7">
        <div className="space-y-4">
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-sm font-medium text-zinc-900 outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.restaurantName} — {category.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Nombre del producto"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-sm font-medium text-zinc-900 outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10"
        />

        <textarea
          placeholder="Descripción del producto"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-sm font-medium text-zinc-900 outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10"
        />

        <input
          type="number"
          step="0.01"
          placeholder="Precio (€)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-sm font-medium text-zinc-900 outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10"
        />

        <div>
          <label
            htmlFor="product-image"
            className="mb-2 block text-sm font-semibold text-zinc-700"
          >
            Imagen del producto
          </label>

          <input
            id="product-image"
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-sm font-medium text-zinc-700 outline-none transition file:mr-4 file:rounded-xl file:border-0 file:bg-zinc-950 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-zinc-800 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10"
          />

          {image && (
            <div className="mt-3 flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-sm text-white">
                📷
              </div>
              <p className="min-w-0 truncate text-sm font-semibold text-zinc-600">
                {image.name}
              </p>
            </div>
          )}
        </div>
        </div>

        <button
          type="button"
          onClick={createProduct}
          disabled={loading || categories.length === 0}
          className="mt-5 rounded-2xl bg-red-500 px-6 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-red-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Creando..." : "Crear producto →"}
        </button>

        {message && (
          <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
            <p className="text-sm font-semibold text-zinc-700">
              {message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
