"use client";

import { useState } from "react";

export default function CreateCategoryForm() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const createCategory = async () => {
    if (!name.trim()) {
      setMessage("Escribe el nombre de la categoría.");
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
          name: name.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error || "No se pudo crear la categoría."
        );
        return;
      }

      setMessage("✅ Categoría creada correctamente.");
      setName("");

      window.location.reload();
    } catch (error) {
      console.error(error);
      setMessage("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-5 rounded-xl border border-zinc-200 p-4">
      <h3 className="font-bold text-zinc-900">
        Añadir categoría
      </h3>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Ej: Hamburguesas"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-red-500"
        />

        <button
          type="button"
          onClick={createCategory}
          disabled={loading}
          className="rounded-xl bg-red-500 px-6 py-3 font-bold text-white hover:bg-red-600 disabled:opacity-50"
        >
          {loading ? "Creando..." : "Crear categoría"}
        </button>
      </div>

      {message && (
        <p className="mt-3 text-sm font-medium text-zinc-700">
          {message}
        </p>
      )}
    </div>
  );
}
