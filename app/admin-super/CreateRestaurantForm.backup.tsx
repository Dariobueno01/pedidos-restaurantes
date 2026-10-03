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
    <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-zinc-900">
        Crear restaurante
      </h2>

      <p className="mt-1 text-sm text-zinc-500">
        Crea el restaurante y su cuenta de administrador.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <input
          type="text"
          placeholder="Nombre del restaurante"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-red-500"
        />

        <input
          type="text"
          placeholder="slug-ejemplo"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-red-500"
        />

        <input
          type="email"
          placeholder="Email del administrador"
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
          className="rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-red-500"
        />

        <input
          type="password"
          placeholder="Contraseña inicial"
          value={adminPassword}
          onChange={(e) => setAdminPassword(e.target.value)}
          className="rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-red-500"
        />
      </div>

      <button
        type="button"
        onClick={createRestaurant}
        disabled={loading}
        className="mt-4 rounded-xl bg-red-500 px-6 py-3 font-bold text-white hover:bg-red-600 disabled:opacity-50"
      >
        {loading ? "Creando..." : "Crear restaurante + administrador"}
      </button>

      {message && (
        <p className="mt-4 text-sm font-medium text-zinc-700">
          {message}
        </p>
      )}
    </div>
  );
}
