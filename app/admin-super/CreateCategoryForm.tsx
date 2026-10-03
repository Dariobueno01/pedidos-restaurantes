"use client";

import { useState } from "react";

type Restaurant = {
  slug: string;
  name: string;
};

type Props = {
  restaurants: Restaurant[];
};

export default function CreateCategoryForm({
  restaurants,
}: Props) {
  const [restaurantSlug, setRestaurantSlug] = useState(
    restaurants[0]?.slug ?? ""
  );
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const createCategory = async () => {
    if (!restaurantSlug || !name) {
      setMessage("Selecciona un restaurante y escribe el nombre.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantSlug,
          name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "No se pudo crear la categoría.");
        return;
      }

      setMessage("✅ Categoría creada correctamente.");
      setName("");
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
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-xl text-white shadow-sm">
            🗂️
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-red-500">
              Organización
            </p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-zinc-950">
              Crear categoría
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Añade una nueva categoría al menú de un restaurante.
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 sm:px-7">
        <div className="grid gap-4 md:grid-cols-2">
        <select
          value={restaurantSlug}
          onChange={(e) => setRestaurantSlug(e.target.value)}
          className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-sm font-medium text-zinc-900 outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10"
        >
          {restaurants.map((restaurant) => (
            <option key={restaurant.slug} value={restaurant.slug}>
              {restaurant.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Ej: Hamburguesas"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-sm font-medium text-zinc-900 outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10"
        />
        </div>

        <button
          type="button"
          onClick={createCategory}
          disabled={loading || restaurants.length === 0}
          className="mt-5 rounded-2xl bg-red-500 px-6 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-red-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Creando..." : "Crear categoría →"}
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
