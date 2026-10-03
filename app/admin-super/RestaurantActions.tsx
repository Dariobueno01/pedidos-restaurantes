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
      <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50/70">
        <div className="border-b border-zinc-200 bg-white px-5 py-4">
          <p className="text-xs font-black uppercase tracking-wider text-red-500">
            Configuración
          </p>
          <h3 className="mt-1 text-base font-black text-zinc-950">
            Editar restaurante
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Modifica los datos principales de este restaurante.
          </p>
        </div>

        <div className="p-5">
          <div className="grid gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del restaurante"
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
          />

          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Slug"
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
          />

          <label className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700">
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
              className="rounded-xl bg-zinc-950 px-5 py-2.5 text-sm font-black text-white transition hover:bg-zinc-800 disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>

            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={loading}
              className="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-black text-zinc-700 transition hover:bg-zinc-100"
            >
              Cancelar
            </button>
          </div>

          {message && (
            <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
              <p className="text-sm font-semibold text-zinc-600">
                {message}
              </p>
            </div>
          )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-zinc-800 hover:shadow-md"
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
            : "bg-emerald-500 hover:bg-emerald-600"
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
        className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-red-600 hover:shadow-md disabled:opacity-50"
      >
        🗑️ Eliminar
      </button>

      {message && (
        <span className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-600">
          {message}
        </span>
      )}
    </div>
  );
}
