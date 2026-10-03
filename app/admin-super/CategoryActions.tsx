"use client";

import { useState } from "react";

type CategoryActionsProps = {
  category: {
    id: string;
    name: string;
    productCount: number;
  };
};

export default function CategoryActions({
  category,
}: CategoryActionsProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const saveChanges = async () => {
    if (!name.trim()) {
      setMessage("El nombre es obligatorio.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/categories", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: category.id,
          name,
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

  const deleteCategory = async () => {
    if (category.productCount > 0) {
      setMessage(
        "Esta categoría tiene productos. Elimina los productos primero."
      );
      return;
    }

    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar "${category.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/categories", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: category.id,
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
      <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50/70 shadow-sm">
        <div className="border-b border-zinc-200 bg-white px-4 py-4">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-red-500">
            Configuración
          </p>
          <h4 className="mt-1 text-base font-black text-zinc-950">
            Editar categoría
          </h4>
          <p className="mt-1 text-xs font-medium text-zinc-500">
            Modifica el nombre de esta categoría.
          </p>
        </div>

        <div className="grid gap-3 p-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-sm font-medium text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5"
          />

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={saveChanges}
              disabled={loading}
              className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>

            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={loading}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-black text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>

          {message && (
            <div className="rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-sm font-bold text-zinc-600">
              {message}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-zinc-800"
      >
        ✏️ Editar
      </button>

      <button
        type="button"
        onClick={deleteCategory}
        disabled={loading || category.productCount > 0}
        className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        🗑️ Eliminar
      </button>

      {category.productCount > 0 && (
        <span className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-bold text-zinc-500">
          Tiene {category.productCount} producto
          {category.productCount !== 1 ? "s" : ""}
        </span>
      )}

      {message && (
        <span className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-bold text-zinc-600">
          {message}
        </span>
      )}
    </div>
  );
}
