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
      <div className="mt-3">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-lg bg-zinc-800 px-3 py-2 text-sm font-bold text-white hover:bg-zinc-700"
        >
          👤 Gestionar administrador
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-xl bg-zinc-50 p-4">
      <h4 className="font-bold text-zinc-900">
        Gestionar administrador
      </h4>

      <div className="mt-3 grid gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email del administrador"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nueva contraseña (opcional)"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2"
        />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={saveChanges}
            disabled={loading}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
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
            className="rounded-lg bg-zinc-200 px-4 py-2 text-sm font-bold text-zinc-800"
          >
            Cancelar
          </button>
        </div>

        {message && (
          <p className="text-sm font-medium text-zinc-600">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
