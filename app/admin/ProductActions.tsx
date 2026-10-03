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
    if (!name.trim()) {
      setMessage("El nombre es obligatorio.");
      return;
    }

    if (!price || Number.isNaN(Number(price)) || Number(price) < 0) {
      setMessage("Introduce un precio válido.");
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
          name: name.trim(),
          description: description.trim(),
          price: Number(price),
          isAvailable,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "No se pudo actualizar el producto.");
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

  const deleteProduct = async () => {
    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar "${product.name}"?`
    );

    if (!confirmed) return;

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
        setMessage(
          data.error || "No se pudo eliminar el producto."
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

  const reorderProduct = async (
    direction: "up" | "down"
  ) => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/products/reorder",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: product.id,
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

  const toggleAvailability = async () => {
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
          name: product.name,
          description: product.description ?? "",
          price: product.price,
          isAvailable: !product.isAvailable,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error || "No se pudo cambiar la disponibilidad."
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
    <div className="mt-3">
      {!editing ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => reorderProduct("up")}
            disabled={loading}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-bold hover:bg-zinc-100 disabled:opacity-50"
            title="Subir producto"
          >
            ↑
          </button>

          <button
            type="button"
            onClick={() => reorderProduct("down")}
            disabled={loading}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-bold hover:bg-zinc-100 disabled:opacity-50"
            title="Bajar producto"
          >
            ↓
          </button>

          <button
            type="button"
            onClick={() => setEditing(true)}
            disabled={loading}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-bold text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            ✏️ Editar
          </button>

          <button
            type="button"
            onClick={toggleAvailability}
            disabled={loading}
            className={`rounded-lg px-4 py-2 text-sm font-bold ${
              product.isAvailable
                ? "border border-amber-300 text-amber-700 hover:bg-amber-50"
                : "border border-green-300 text-green-700 hover:bg-green-50"
            } disabled:opacity-50`}
          >
            {product.isAvailable
              ? "Marcar no disponible"
              : "Marcar disponible"}
          </button>

          <button
            type="button"
            onClick={deleteProduct}
            disabled={loading}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-50"
          >
            🗑️ Eliminar
          </button>
        </div>
      ) : (
        <div className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-blue-500"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción"
            rows={3}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-blue-500"
          />

          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Precio"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-blue-500"
          />

          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
            />
            Producto disponible
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={saveChanges}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>

            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setName(product.name);
                setDescription(product.description ?? "");
                setPrice(String(product.price));
                setIsAvailable(product.isAvailable);
                setMessage("");
              }}
              disabled={loading}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-bold hover:bg-zinc-100 disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {message && (
        <p className="mt-2 text-sm font-medium text-red-600">
          {message}
        </p>
      )}
    </div>
  );
}
