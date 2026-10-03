"use client";

import { useState } from "react";

type Props = {
  orderId: string;
  currentStatus: string;
  orderType?: string;
};

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  PREPARING: "Preparando",
  READY_FOR_PICKUP: "Listo para recoger",
  OUT_FOR_DELIVERY: "En reparto",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

export default function OrderStatusButtons({
  orderId,
  currentStatus,
  orderType = "DELIVERY",
}: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const isPickup = orderType === "PICKUP";

  const getNextAction = () => {
    if (status === "PENDING") {
      return {
        value: "CONFIRMED",
        label: "✓ Confirmar pedido",
        className: "bg-emerald-600 hover:bg-emerald-700",
      };
    }

    if (status === "CONFIRMED") {
      return {
        value: "PREPARING",
        label: "🍳 Empezar preparación",
        className: "bg-blue-600 hover:bg-blue-700",
      };
    }

    if (status === "PREPARING") {
      if (isPickup) {
        return {
          value: "READY_FOR_PICKUP",
          label: "🏪 Marcar listo para recoger",
          className: "bg-purple-600 hover:bg-purple-700",
        };
      }

      return {
        value: "OUT_FOR_DELIVERY",
        label: "🛵 Enviar a reparto",
        className: "bg-orange-500 hover:bg-orange-600",
      };
    }

    if (status === "READY_FOR_PICKUP") {
      return {
        value: "DELIVERED",
        label: "✓ Marcar como recogido",
        className: "bg-purple-600 hover:bg-purple-700",
      };
    }

    if (status === "OUT_FOR_DELIVERY") {
      return {
        value: "DELIVERED",
        label: "✓ Marcar como entregado",
        className: "bg-purple-600 hover:bg-purple-700",
      };
    }

    return null;
  };

  const changeStatus = async (newStatus: string) => {
    setLoading(true);

    try {
      const response = await fetch("/api/orders/status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "No se pudo actualizar el pedido.");
        return;
      }

      setStatus(newStatus);
    } catch (error) {
      console.error(error);
      alert("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  const nextAction = getNextAction();

  return (
    <div className="mt-5 border-t border-zinc-100 pt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-zinc-400">
            Estado del pedido
          </p>

          <p className="mt-1 text-sm font-black text-zinc-950">
            {statusLabels[status] ?? status}
          </p>
        </div>

        {status === "DELIVERED" && (
          <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-black text-emerald-700">
            ✓ Completado
          </span>
        )}

        {status === "CANCELLED" && (
          <span className="rounded-full bg-red-100 px-3 py-1.5 text-xs font-black text-red-700">
            ✕ Cancelado
          </span>
        )}
      </div>

      {nextAction && (
        <button
          type="button"
          disabled={loading}
          onClick={() => changeStatus(nextAction.value)}
          className={`mt-4 w-full rounded-2xl px-5 py-3.5 text-sm font-black text-white shadow-sm transition hover:shadow-md active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 ${nextAction.className}`}
        >
          {loading ? "Actualizando pedido..." : nextAction.label}
        </button>
      )}

      {status === "PENDING" && (
        <button
          type="button"
          disabled={loading}
          onClick={() => changeStatus("CANCELLED")}
          className="mt-2 w-full rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-black text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ✕ Cancelar pedido
        </button>
      )}
    </div>
  );
}
