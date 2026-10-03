"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type LastOrder = {
  orderId: string | null;
  restaurantSlug: string;
  orderType: "DELIVERY" | "PICKUP";
  paymentMethod: "CASH" | "CARD";
  total: number | null;
};

export default function PedidoConfirmadoPage() {
  const searchParams = useSearchParams();
  const restaurantSlug = searchParams.get("restaurant");

  const [order, setOrder] = useState<LastOrder | null>(null);
  const [status, setStatus] = useState<string>("PENDING");
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    const saved = sessionStorage.getItem("last-order");

    if (!saved) {
      setLoadingStatus(false);
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      setOrder(parsed);

      if (!parsed.orderId) {
        setLoadingStatus(false);
        return;
      }

      let active = true;

      const loadStatus = async () => {
        try {
          const response = await fetch(`/api/orders/${parsed.orderId}`, {
            cache: "no-store",
          });

          const data = await response.json();

          if (response.ok && active) {
            setStatus(data.order.status);
          }
        } catch (error) {
          console.error("Error consultando estado:", error);
        } finally {
          if (active) {
            setLoadingStatus(false);
          }
        }
      };

      loadStatus();

      const interval = window.setInterval(loadStatus, 5000);

      return () => {
        active = false;
        window.clearInterval(interval);
      };
    } catch {
      sessionStorage.removeItem("last-order");
      setLoadingStatus(false);
    }
  }, []);

  const slug = order?.restaurantSlug || restaurantSlug;

  return (
    <main className="min-h-screen bg-zinc-50 px-5 py-10">
      <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">
        <section className="w-full overflow-hidden rounded-[2rem] border border-zinc-100 bg-white shadow-xl">
          
          <div className="bg-zinc-950 px-6 py-10 text-center text-white sm:px-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-4xl shadow-lg">
              ✓
            </div>

            <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-red-400">
              Pedido recibido
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              ¡Pedido realizado!
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-zinc-300">
              El restaurante ha recibido tu pedido y comenzará a prepararlo.
            </p>
          </div>

          <div className="p-6 sm:p-8">

            <div className="rounded-2xl bg-zinc-50 p-5">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full text-xl ${
                    status === "DELIVERED"
                      ? "bg-emerald-100"
                      : status === "CANCELLED"
                        ? "bg-red-100"
                        : status === "OUT_FOR_DELIVERY"
                          ? "bg-blue-100"
                          : status === "PREPARING"
                            ? "bg-orange-100"
                            : status === "CONFIRMED"
                              ? "bg-blue-100"
                              : "bg-amber-100"
                  }`}
                >
                  {status === "DELIVERED"
                    ? "🟢"
                    : status === "CANCELLED"
                      ? "🔴"
                      : status === "OUT_FOR_DELIVERY"
                        ? "🛵"
                        : status === "PREPARING"
                          ? "🍳"
                          : status === "CONFIRMED"
                            ? "🔵"
                            : "🟡"}
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
                    Estado actual
                  </p>

                  <p className="mt-1 text-lg font-black text-zinc-950">
                    {loadingStatus
                      ? "Comprobando estado..."
                      : status === "PENDING"
                        ? "Pedido recibido"
                        : status === "CONFIRMED"
                          ? "Pedido confirmado"
                          : status === "PREPARING"
                            ? "Preparando tu pedido"
                            : status === "OUT_FOR_DELIVERY"
                              ? "En camino"
                              : status === "DELIVERED"
                                ? "Pedido entregado"
                                : status === "CANCELLED"
                                  ? "Pedido cancelado"
                                  : "Pedido recibido"}
                  </p>
                </div>
              </div>
            </div>

            {/* PROGRESO DEL PEDIDO */}
            <div className="mt-6 rounded-3xl border border-zinc-100 bg-white p-5 shadow-sm">
              <div className="mb-5">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-red-500">
                  Seguimiento
                </p>

                <h2 className="mt-1 text-xl font-black tracking-tight text-zinc-950">
                  Estado de tu pedido
                </h2>
              </div>

              {(() => {
                const isPickup = order?.orderType === "PICKUP";

                const steps = isPickup
                  ? [
                      {
                        key: "PENDING",
                        label: "Recibido",
                        icon: "🟡",
                      },
                      {
                        key: "CONFIRMED",
                        label: "Confirmado",
                        icon: "🔵",
                      },
                      {
                        key: "PREPARING",
                        label: "Preparando",
                        icon: "🍳",
                      },
                      {
                        key: "DELIVERED",
                        label: "Listo / recogido",
                        icon: "🟢",
                      },
                    ]
                  : [
                      {
                        key: "PENDING",
                        label: "Recibido",
                        icon: "🟡",
                      },
                      {
                        key: "CONFIRMED",
                        label: "Confirmado",
                        icon: "🔵",
                      },
                      {
                        key: "PREPARING",
                        label: "Preparando",
                        icon: "🍳",
                      },
                      {
                        key: "OUT_FOR_DELIVERY",
                        label: "En camino",
                        icon: "🛵",
                      },
                      {
                        key: "DELIVERED",
                        label: "Entregado",
                        icon: "🟢",
                      },
                    ];

                const currentIndex = steps.findIndex(
                  (step) => step.key === status
                );

                const activeIndex =
                  currentIndex === -1 ? 0 : currentIndex;

                return (
                  <div className="space-y-0">
                    {steps.map((step, index) => {
                      const completed = index < activeIndex;
                      const active = index === activeIndex;

                      return (
                        <div key={step.key} className="flex items-stretch">
                          <div className="flex w-12 flex-col items-center">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg transition-all ${
                                active
                                  ? "scale-110 bg-red-500 shadow-lg shadow-red-500/20"
                                  : completed
                                    ? "bg-emerald-100"
                                    : "bg-zinc-100 grayscale"
                              }`}
                            >
                              {completed ? "✓" : step.icon}
                            </div>

                            {index < steps.length - 1 && (
                              <div
                                className={`my-1 min-h-8 w-0.5 flex-1 ${
                                  completed
                                    ? "bg-emerald-400"
                                    : "bg-zinc-200"
                                }`}
                              />
                            )}
                          </div>

                          <div className="pb-5 pl-4 pt-1">
                            <p
                              className={`text-sm font-black ${
                                active
                                  ? "text-zinc-950"
                                  : completed
                                    ? "text-zinc-700"
                                    : "text-zinc-400"
                              }`}
                            >
                              {step.label}
                            </p>

                            {active && (
                              <p className="mt-1 text-xs font-medium text-zinc-500">
                                {status === "PENDING"
                                  ? "Hemos recibido tu pedido."
                                  : status === "CONFIRMED"
                                    ? "El restaurante ha confirmado tu pedido."
                                    : status === "PREPARING"
                                      ? "Estamos preparando tu pedido."
                                      : status === "OUT_FOR_DELIVERY"
                                        ? "Tu pedido está en camino."
                                        : "¡Disfruta de tu pedido!"}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">

              <div className="rounded-2xl border border-zinc-100 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
                  Entrega
                </p>

                <p className="mt-1 font-black text-zinc-950">
                  {order?.orderType === "PICKUP"
                    ? "🏪 Recogida"
                    : "🛵 A domicilio"}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-100 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
                  Pago
                </p>

                <p className="mt-1 font-black text-zinc-950">
                  {order?.paymentMethod === "CARD"
                    ? "💳 Tarjeta"
                    : "💵 Efectivo"}
                </p>
              </div>

            </div>

            {order?.orderId && (
              <div className="mt-5 rounded-2xl border border-zinc-100 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
                  Número de pedido
                </p>

                <p className="mt-1 break-all font-mono text-sm font-bold text-zinc-950">
                  #{order.orderId}
                </p>
              </div>
            )}

            {order?.total !== null && order?.total !== undefined && (
              <div className="mt-5 flex items-end justify-between border-t border-zinc-100 pt-5">
                <span className="font-bold text-zinc-500">
                  Total
                </span>

                <span className="text-3xl font-black tracking-tight text-zinc-950">
                  {Number(order.total).toFixed(2)} €
                </span>
              </div>
            )}

            <div className="mt-7 space-y-3">

              {slug && (
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = `/r/${slug}`;
                  }}
                  className="w-full rounded-2xl bg-zinc-950 py-4 font-black text-white transition hover:bg-red-500 active:scale-[0.98]"
                >
                  Volver al menú
                </button>
              )}

              <p className="text-center text-xs leading-5 text-zinc-400">
                Guarda tu número de pedido por si necesitas consultar tu pedido
                con el restaurante.
              </p>

            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
