"use client";

import { useState } from "react";

type ProductActionsProps = {
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    isAvailable: boolean;
  };
};

export default function ProductActions({
  product,
}: ProductActionsProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(
    product.description ?? ""
  );
  const [price, setPrice] = useState(String(product.price));
  const [isAvailable, setIsAvailable] = useState(
    product.isAvailable
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const saveChanges = async () => {
    if (!name.trim() || !price) {
      setMessage("Nombre y precio son obligatorios.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/products", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: product.id,
          name,
          description,
          price: Number(price),
          isAvailable,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "No se pudo editar.");
        return;
      }

      setEditing(false);
      setMessage("✅ Guardado.");

      window.location.reload();
    } catch (error) {
      console.error(error);
      setMessage("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async () => {
    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/products", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: product.id,
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
      <div className="mt-4 rounded-xl bg-zinc-50 p-4">
        <div className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            placeholder="Nombre"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            placeholder="Descripción"
          />

          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            placeholder="Precio"
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={(e) =>
                setIsAvailable(e.target.checked)
              }
            />
            Producto disponible
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
              className="rounded-lg bg-zinc-300 px-4 py-2 text-sm font-bold text-zinc-800"
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
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-bold text-white hover:bg-zinc-800"
      >
        ✏️ Editar
      </button>

      <button
        type="button"
        onClick={deleteProduct}
        disabled={loading}
        className="rounded-lg bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-50"
      >
        🗑️ Eliminar
      </button>

      {!product.isAvailable && (
        <span className="rounded-lg bg-yellow-100 px-3 py-2 text-xs font-semibold text-yellow-800">
          No disponible
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
