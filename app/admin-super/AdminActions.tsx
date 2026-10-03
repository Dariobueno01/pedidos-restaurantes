"use client";

import { useState } from "react";

type AdminActionsProps = {
  admin: {
    id: string;
    email: string;
  } | null;
};

export default function AdminActions({
  admin,
}: AdminActionsProps) {
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState(admin?.email ?? "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!admin) {
    return (
      <p className="mt-2 text-sm text-zinc-500">
        Sin administrador asignado.
      </p>
    );
  }

  const saveChanges = async () => {
    if (!email.trim() && !password.trim()) {
      setMessage("Introduce un nuevo email o contraseña.");
      return;
    }

    if (password && password.length < 6) {
      setMessage(
        "La contraseña debe tener al menos 6 caracteres."
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/restaurant-admin",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: admin.id,
            email: email.trim() || undefined,
            password: password || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error ||
            "No se pudo actualizar el administrador."
        );
        return;
      }

      setMessage("✅ Administrador actualizado correctamente.");
      setPassword("");

      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (error) {
      console.error(error);
      setMessage("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  if (!editing) {
    return (
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-zinc-800"
        >
          👤 Gestionar administrador
          <span className="text-zinc-400">→</span>
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50/70 shadow-sm">
      <div className="border-b border-zinc-200 bg-white px-4 py-4">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-red-500">
          Acceso del restaurante
        </p>
        <h4 className="mt-1 text-base font-black text-zinc-950">
          Gestionar administrador
        </h4>
        <p className="mt-1 text-xs font-medium text-zinc-500">
          Actualiza el email o establece una nueva contraseña.
        </p>
      </div>

      <div className="grid gap-3 p-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email del administrador"
          className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-sm font-medium text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nueva contraseña (opcional)"
          className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-sm font-medium text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5"
        />

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={saveChanges}
            disabled={loading}
            className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>

          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setPassword("");
              setMessage("");
            }}
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
