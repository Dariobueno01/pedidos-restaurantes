"use client";

import { useState } from "react";

type RestaurantActionsProps = {
  restaurant: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
  };
};

export default function RestaurantActions({
  restaurant,
}: RestaurantActionsProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(restaurant.name);
  const [slug, setSlug] = useState(restaurant.slug);
  const [isActive, setIsActive] = useState(restaurant.isActive);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const saveChanges = async () => {
    if (!name.trim() || !slug.trim()) {
      setMessage("Nombre y slug son obligatorios.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/restaurants", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: restaurant.id,
          name,
          slug,
          isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "No se pudo editar.");
        return;
      }

      window.location.reload();
    } catch (error) {
      console.error(error);
      setMessage("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/restaurants", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: restaurant.id,
          name: restaurant.name,
          slug: restaurant.slug,
          isActive: !restaurant.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "No se pudo cambiar el estado.");
        return;
      }

      window.location.reload();
    } catch (error) {
      console.error(error);
      setMessage("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  const deleteRestaurant = async () => {
    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar "${restaurant.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/restaurants", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: restaurant.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "No se pudo eliminar.");
        return;
      }

      window.location.reload();
    } catch (error) {
      console.error(error);
      setMessage("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  if (editing) {
    return (
      <div className="mt-5 rounded-xl bg-zinc-50 p-4">
        <div className="grid gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del restaurante"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          />

          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Slug"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Restaurante activo
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={saveChanges}
              disabled={loading}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>

            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={loading}
              className="rounded-lg bg-zinc-200 px-4 py-2 text-sm font-bold text-zinc-800"
            >
              Cancelar
            </button>
          </div>

          {message && (
            <p className="text-sm text-zinc-600">
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-bold text-white hover:bg-zinc-800"
      >
        ✏️ Editar
      </button>

      <button
        type="button"
        onClick={toggleActive}
        disabled={loading}
        className={`rounded-lg px-4 py-2 text-sm font-bold text-white disabled:opacity-50 ${
          restaurant.isActive
            ? "bg-orange-500 hover:bg-orange-600"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {restaurant.isActive
          ? "🔴 Desactivar"
          : "🟢 Activar"}
      </button>

      <button
        type="button"
        onClick={deleteRestaurant}
        disabled={loading}
        className="rounded-lg bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-50"
      >
        🗑️ Eliminar
      </button>

      {message && (
        <span className="text-sm text-zinc-600">
          {message}
        </span>
      )}
    </div>
  );
}
