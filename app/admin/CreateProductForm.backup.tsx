"use client";

import { useState } from "react";

type Category = {
  id: string;
  name: string;
};

type Props = {
  categories: Category[];
};

export default function CreateProductForm({
  categories,
}: Props) {
  const [categoryId, setCategoryId] = useState(
    categories[0]?.id ?? ""
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const createProduct = async () => {
    if (!categoryId || !name.trim() || !price) {
      setMessage(
        "Completa categoría, nombre y precio."
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      let imageUrl = "";

      if (image) {
        const formData = new FormData();

        formData.append("file", image);

        const uploadResponse = await fetch(
          "/api/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        const uploadData =
          await uploadResponse.json();

        if (!uploadResponse.ok) {
          setMessage(
            uploadData.error ||
              "No se pudo subir la imagen."
          );
          return;
        }

        imageUrl = uploadData.url;
      }

      const response = await fetch(
        "/api/products",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            categoryId,
            name: name.trim(),
            description: description.trim(),
            price: Number(price),
            imageUrl,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error ||
            "No se pudo crear el producto."
        );
        return;
      }

      setMessage(
        "✅ Producto creado correctamente."
      );

      setName("");
      setDescription("");
      setPrice("");
      setImage(null);

      const fileInput =
        document.getElementById(
          "restaurant-product-image"
        ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      window.location.reload();
    } catch (error) {
      console.error(error);

      setMessage("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-5 rounded-xl border border-zinc-200 p-4">
      <h3 className="font-bold text-zinc-900">
        Añadir producto
      </h3>

      {categories.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">
          Primero crea una categoría.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          <select
            value={categoryId}
            onChange={(e) =>
              setCategoryId(e.target.value)
            }
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-red-500"
          >
            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Nombre del producto"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-red-500"
          />

          <textarea
            placeholder="Descripción del producto"
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            rows={3}
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-red-500"
          />

          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Precio (€)"
            value={price}
            onChange={(e) =>
              setPrice(e.target.value)
            }
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-red-500"
          />

          <div>
            <label
              htmlFor="restaurant-product-image"
              className="mb-2 block text-sm font-semibold text-zinc-700"
            >
              Imagen del producto
            </label>

            <input
              id="restaurant-product-image"
              type="file"
              accept="image/*"
              onChange={(e) =>
                setImage(
                  e.target.files?.[0] ?? null
                )
              }
              className="w-full rounded-xl border border-zinc-300 px-4 py-3"
            />

            {image && (
              <p className="mt-2 text-sm text-zinc-500">
                📷 {image.name}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={createProduct}
            disabled={loading}
            className="w-full rounded-xl bg-red-500 px-6 py-3 font-bold text-white hover:bg-red-600 disabled:opacity-50"
          >
            {loading
              ? "Creando..."
              : "Crear producto"}
          </button>
        </div>
      )}

      {message && (
        <p className="mt-3 text-sm font-medium text-zinc-700">
          {message}
        </p>
      )}
    </div>
  );
}
