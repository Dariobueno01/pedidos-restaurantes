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
      <div className="mt-3 rounded-xl bg-white p-3">
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="min-w-[220px] flex-1 rounded-lg border border-zinc-300 px-3 py-2"
          />

          <button
            type="button"
            onClick={saveChanges}
            disabled={loading}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white"
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
          <p className="mt-2 text-sm text-zinc-600">
            {message}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-bold text-white hover:bg-zinc-800"
      >
        ✏️ Editar
      </button>

      <button
        type="button"
        onClick={deleteCategory}
        disabled={loading || category.productCount > 0}
        className="rounded-lg bg-red-500 px-3 py-2 text-sm font-bold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        🗑️ Eliminar
      </button>

      {category.productCount > 0 && (
        <span className="text-xs text-zinc-500">
          Tiene {category.productCount} producto
          {category.productCount !== 1 ? "s" : ""}
        </span>
      )}

      {message && (
        <span className="text-sm text-zinc-600">
          {message}
        </span>
      )}
    </div>
  );
}
