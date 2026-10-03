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
    <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-zinc-900">
        Crear categoría
      </h2>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <select
          value={restaurantSlug}
          onChange={(e) => setRestaurantSlug(e.target.value)}
          className="rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-red-500"
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
          className="rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-red-500"
        />
      </div>

      <button
        type="button"
        onClick={createCategory}
        disabled={loading || restaurants.length === 0}
        className="mt-4 rounded-xl bg-red-500 px-6 py-3 font-bold text-white hover:bg-red-600 disabled:opacity-50"
      >
        {loading ? "Creando..." : "Crear categoría"}
      </button>

      {message && (
        <p className="mt-4 text-sm font-medium text-zinc-700">
          {message}
        </p>
      )}
    </div>
  );
}
