"use client";

import { useState } from "react";

type CategoryActionsProps = {
  category: {
    id: string;
    name: string;
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
          name: name.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "No se pudo editar.");
        return;
      }

      setEditing(false);
      window.location.reload();
    } catch (error) {
      console.error(error);
      setMessage("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async () => {
    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar "${category.name}"?`
    );

    if (!confirmed) return;

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
        setMessage(
          data.error || "No se pudo eliminar la categoría."
        );
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

  const reorderCategory = async (
    direction: "up" | "down"
  ) => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/categories/reorder",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: category.id,
            direction,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error || "No se pudo cambiar el orden."
        );
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

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => reorderCategory("up")}
        disabled={loading}
        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-bold hover:bg-zinc-100 disabled:opacity-50"
        title="Subir categoría"
      >
        ↑
      </button>

      <button
        type="button"
        onClick={() => reorderCategory("down")}
        disabled={loading}
        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-bold hover:bg-zinc-100 disabled:opacity-50"
        title="Bajar categoría"
      >
        ↓
      </button>

      {!editing ? (
        <button
          type="button"
          onClick={() => setEditing(true)}
          disabled={loading}
          className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 disabled:opacity-50"
        >
          Editar
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={saveChanges}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>

          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setName(category.name);
              setMessage("");
            }}
            disabled={loading}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-bold hover:bg-zinc-100 disabled:opacity-50"
          >
            Cancelar
          </button>
        </>
      )}

      <button
        type="button"
        onClick={deleteCategory}
        disabled={loading}
        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        Eliminar
      </button>

      {editing && (
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 sm:w-56"
          placeholder="Nombre de categoría"
        />
      )}

      {message && (
        <p className="w-full text-sm font-medium text-red-600">
          {message}
        </p>
      )}
    </div>
  );
}
