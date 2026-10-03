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
      <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50/70 shadow-sm">
        <div className="border-b border-zinc-200 bg-white px-4 py-4">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-red-500">
            Configuración
          </p>
          <h4 className="mt-1 text-base font-black text-zinc-950">
            Editar producto
          </h4>
          <p className="mt-1 text-xs font-medium text-zinc-500">
            Modifica los datos principales de este producto.
          </p>
        </div>

        <div className="space-y-3 p-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-sm font-medium text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5"
            placeholder="Nombre"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-sm font-medium text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5"
            placeholder="Descripción"
          />

          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-sm font-medium text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5"
            placeholder="Precio"
          />

          <label className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-sm font-bold text-zinc-700">
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={(e) =>
                setIsAvailable(e.target.checked)
              }
              className="h-4 w-4 rounded border-zinc-300"
            />
            Producto disponible
          </label>

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
        onClick={deleteProduct}
        disabled={loading}
        className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        🗑️ Eliminar
      </button>

      {!product.isAvailable && (
        <span className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-black text-amber-700">
          No disponible
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
