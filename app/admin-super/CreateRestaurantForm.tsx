"use client";

import { useState } from "react";

export default function CreateRestaurantForm() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const createRestaurant = async () => {
    if (!name || !slug || !adminEmail || !adminPassword) {
      setMessage("Completa todos los campos.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/restaurants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          slug,
          adminEmail,
          adminPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error || "No se pudo crear el restaurante."
        );
        return;
      }

      setMessage(
        `✅ Restaurante creado. Administrador: ${data.admin.email}`
      );

      setName("");
      setSlug("");
      setAdminEmail("");
      setAdminPassword("");

      window.location.reload();
    } catch (error) {
      console.error(error);
      setMessage("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-7 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-100 bg-zinc-50/70 px-6 py-5 sm:px-7">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500 text-xl text-white shadow-sm">
            🍽️
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-red-500">
              Nuevo restaurante
            </p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-zinc-950">
              Crear restaurante
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Crea el restaurante y su cuenta de administrador.
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 sm:px-7">
        <div className="grid gap-4 md:grid-cols-2">
        <input
          type="text"
          placeholder="Nombre del restaurante"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-sm font-medium text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10"
        />

        <input
          type="text"
          placeholder="slug-ejemplo"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-sm font-medium text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10"
        />

        <input
          type="email"
          placeholder="Email del administrador"
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
          className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-sm font-medium text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10"
        />

        <input
          type="password"
          placeholder="Contraseña inicial"
          value={adminPassword}
          onChange={(e) => setAdminPassword(e.target.value)}
          className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-sm font-medium text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10"
        />
        </div>

        <button
          type="button"
          onClick={createRestaurant}
          disabled={loading}
          className="mt-5 rounded-2xl bg-red-500 px-6 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-red-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Creando..." : "Crear restaurante + administrador →"}
        </button>

        {message && (
          <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
            <p className="text-sm font-semibold text-zinc-700">
              {message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
