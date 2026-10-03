"use client";

import { useEffect, useRef, useState } from "react";
import OrderCard from "./OrderCard";

type OrderItem = {
  id: string;
  productName: string;
  unitPrice: number;
  quantity: number;
};

type Order = {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  notes: string | null;
  paymentMethod: string;
  orderType: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
};

type OrdersListProps = {
  orders: Order[];
};

const filters = [
  { value: "ALL", label: "Todos" },
  { value: "PENDING", label: "Pendientes" },
  { value: "CONFIRMED", label: "Confirmados" },
  { value: "PREPARING", label: "Preparando" },
  { value: "OUT_FOR_DELIVERY", label: "En reparto" },
  { value: "DELIVERED", label: "Entregados" },
  { value: "CANCELLED", label: "Cancelados" },
];

export default function OrdersList({
  orders: initialOrders,
}: OrdersListProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState("ALL");
  const [newOrder, setNewOrder] = useState<Order | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const audioContext = useRef<AudioContext | null>(null);

  const knownOrderIds = useRef(
    new Set(initialOrders.map((order) => order.id))
  );

  const activateSound = async () => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (
          window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;

      if (!AudioContextClass) {
        return;
      }

      if (!audioContext.current) {
        audioContext.current = new AudioContextClass();
      }

      if (audioContext.current.state === "suspended") {
        await audioContext.current.resume();
      }

      setSoundEnabled(true);

      const oscillator = audioContext.current.createOscillator();
      const gain = audioContext.current.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = 880;

      gain.gain.setValueAtTime(
        0.001,
        audioContext.current.currentTime
      );

      gain.gain.exponentialRampToValueAtTime(
        0.15,
        audioContext.current.currentTime + 0.02
      );

      gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.current.currentTime + 0.3
      );

      oscillator.connect(gain);
      gain.connect(audioContext.current.destination);

      oscillator.start();
      oscillator.stop(
        audioContext.current.currentTime + 0.3
      );
    } catch (error) {
      console.error("No se pudo activar el sonido:", error);
    }
  };

  const playNotificationSound = () => {
    const context = audioContext.current;

    if (!context || context.state !== "running") {
      return;
    }

    const now = context.currentTime;

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, now);
    oscillator.frequency.setValueAtTime(1046, now + 0.15);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.45);
  };

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await fetch(
          `/api/orders/list?t=${Date.now()}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) return;

        const data = await response.json();

        if (!Array.isArray(data.orders)) return;

        const fetchedOrders = data.orders as Order[];

        const newOrders = fetchedOrders.filter(
          (order) => !knownOrderIds.current.has(order.id)
        );

        if (newOrders.length > 0) {
          const newestOrder = newOrders[0];

          setNewOrder(newestOrder);

          console.log(
            "🔔 NUEVO PEDIDO DETECTADO:",
            newestOrder.id
          );

          if (soundEnabled) {
            playNotificationSound();
          }

          newOrders.forEach((order) => {
            knownOrderIds.current.add(order.id);
          });
        }

        setOrders(fetchedOrders);

        fetchedOrders.forEach((order) => {
          knownOrderIds.current.add(order.id);
        });
      } catch (error) {
        console.error(
          "Error actualizando pedidos:",
          error
        );
      }
    };

    const interval = setInterval(loadOrders, 5000);

    return () => clearInterval(interval);
  }, [soundEnabled]);

  const filteredOrders =
    filter === "ALL"
      ? orders
      : orders.filter(
          (order) => order.status === filter
        );

  const pendingCount = orders.filter(
    (order) => order.status === "PENDING"
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={activateSound}
          className={`rounded-xl px-4 py-2 text-sm font-bold ${
            soundEnabled
              ? "bg-green-100 text-green-700"
              : "bg-zinc-900 text-white hover:bg-zinc-800"
          }`}
        >
          {soundEnabled
            ? "🔊 Sonido activado"
            : "🔔 Activar sonido"}
        </button>

        {soundEnabled && (
          <span className="text-sm text-zinc-500">
            Recibirás un aviso sonoro cuando llegue un pedido nuevo.
          </span>
        )}
      </div>

      {newOrder && (
        <div className="sticky top-4 z-50 rounded-2xl border-2 border-orange-400 bg-orange-50 p-5 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xl font-extrabold text-orange-800">
                🔔 ¡NUEVO PEDIDO!
              </p>

              <p className="mt-1 font-semibold text-orange-700">
                Pedido #{newOrder.id.slice(0, 8)} ·{" "}
                {newOrder.customerName}
              </p>

              <p className="mt-1 text-sm text-orange-700">
                Total: {newOrder.total.toFixed(2)} €
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setNewOrder(null);
                setFilter("PENDING");
              }}
              className="rounded-xl bg-orange-500 px-5 py-3 font-bold text-white hover:bg-orange-600"
            >
              Ver pedido
            </button>
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-zinc-200 bg-white p-2 shadow-sm">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map((item) => {
            const active = filter === item.value;

            const icon =
              item.value === "ALL"
                ? "📦"
                : item.value === "PENDING"
                  ? "🔔"
                  : item.value === "CONFIRMED"
                    ? "✅"
                    : item.value === "PREPARING"
                      ? "🍳"
                      : item.value === "OUT_FOR_DELIVERY"
                        ? "🛵"
                        : item.value === "DELIVERED"
                          ? "🟢"
                          : "❌";

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition-all ${
                  active
                    ? "bg-zinc-950 text-white shadow-md"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                }`}
              >
                <span>{icon}</span>

                <span>{item.label}</span>

                {item.value === "PENDING" &&
                  pendingCount > 0 && (
                    <span
                      className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-black ${
                        active
                          ? "bg-red-500 text-white"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {pendingCount}
                    </span>
                  )}
              </button>
            );
          })}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="text-4xl">📦</div>

          <p className="mt-3 font-semibold text-zinc-900">
            No hay pedidos en este estado
          </p>

          <p className="mt-1 text-sm text-zinc-500">
            Los pedidos que correspondan aparecerán aquí.
          </p>
        </div>
      ) : (
        filteredOrders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
          />
        ))
      )}
    </div>
  );
}
