"use client";

import OrderStatusButtons from "./OrderStatusButtons";

type OrderItem = {
  id: string;
  productName: string;
  unitPrice: number;
  quantity: number;
};

type OrderCardProps = {
  order: {
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
};

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  PREPARING: "Preparando",
  OUT_FOR_DELIVERY: "En reparto",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

export default function OrderCard({ order }: OrderCardProps) {
  const statusLabel =
    statusLabels[order.status] ?? order.status;

  const date = new Date(order.createdAt);

  const formattedDate = date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const statusStyle =
    order.status === "PENDING"
      ? "bg-orange-100 text-orange-700"
      : order.status === "CONFIRMED"
      ? "bg-blue-100 text-blue-700"
      : order.status === "PREPARING"
      ? "bg-purple-100 text-purple-700"
      : order.status === "OUT_FOR_DELIVERY"
      ? "bg-yellow-100 text-yellow-700"
      : order.status === "DELIVERED"
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";

  const isPickup = order.orderType === "PICKUP";

  return (
    <article
      className={`rounded-2xl bg-white p-5 shadow-sm ${
        order.status === "PENDING"
          ? "border-2 border-orange-300"
          : "border border-zinc-200"
      }`}
    >
      <div className="rounded-2xl bg-zinc-50 p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-black tracking-tight text-zinc-950">
                Pedido #{order.id.slice(0, 8)}
              </h3>

              <span
                className={`rounded-full px-3 py-1 text-xs font-black ${statusStyle}`}
              >
                {statusLabel}
              </span>
            </div>

            <p className="mt-2 text-sm font-medium text-zinc-500">
              {formattedDate}
            </p>
          </div>

          <div className="min-w-[120px] text-left sm:text-right">
            <p className="text-xs font-black uppercase tracking-wide text-zinc-400">
              Total
            </p>

            <p className="mt-1 text-2xl font-black tracking-tight text-zinc-950">
              {order.total.toFixed(2)} €
            </p>

            <p className="mt-1 text-sm font-bold text-zinc-600">
              {order.paymentMethod === "CASH"
                ? "💵 Efectivo"
                : order.paymentMethod === "CARD"
                ? "💳 Tarjeta"
                : order.paymentMethod}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 border-t border-zinc-100 pt-5 md:grid-cols-2">
        {/* TIPO DE PEDIDO */}
        <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-zinc-400">
            Tipo de pedido
          </p>

          <div className="mt-3 flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${
                isPickup ? "bg-blue-100" : "bg-orange-100"
              }`}
            >
              {isPickup ? "🏪" : "🛵"}
            </div>

            <div>
              <p className="font-black text-zinc-950">
                {isPickup
                  ? "Recogida en restaurante"
                  : "Entrega a domicilio"}
              </p>

              <p className="mt-0.5 text-xs font-medium text-zinc-500">
                {isPickup
                  ? "El cliente recogerá el pedido"
                  : "Enviar al domicilio indicado"}
              </p>
            </div>
          </div>
        </div>

        {/* CLIENTE */}
        <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-zinc-400">
            Cliente
          </p>

          <p className="mt-3 font-black text-zinc-950">
            👤 {order.customerName}
          </p>

          <p className="mt-1 text-sm font-medium text-zinc-600">
            📞 {order.customerPhone}
          </p>
        </div>
      </div>

      {/* DIRECCIÓN / RECOGIDA */}
      <div className="mt-4 rounded-2xl border border-zinc-100 bg-white p-4">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-zinc-400">
          {isPickup ? "Lugar de recogida" : "Dirección de entrega"}
        </p>

        <div className="mt-3 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-lg">
            {isPickup ? "🏪" : "📍"}
          </div>

          <p className="pt-1 text-sm font-bold leading-6 text-zinc-800">
            {order.address}
          </p>
        </div>
      </div>

      {order.notes && (
        <div className="mt-4 rounded-xl bg-yellow-50 p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-yellow-700">
            Nota del cliente
          </p>

          <p className="mt-1 text-sm text-yellow-900">
            {order.notes}
          </p>
        </div>
      )}

      <div className="mt-5 border-t border-zinc-200 pt-5">
        <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
          Productos
        </p>

        <div className="mt-3 space-y-2">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 rounded-lg bg-zinc-50 px-3 py-2"
            >
              <p className="text-sm text-zinc-800">
                <span className="font-bold">
                  {item.quantity} ×
                </span>{" "}
                {item.productName}
              </p>

              <p className="shrink-0 text-sm font-semibold text-zinc-900">
                {(item.unitPrice * item.quantity).toFixed(2)} €
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 border-t border-zinc-200 pt-5">
        <OrderStatusButtons
          orderId={order.id}
          currentStatus={order.status}
          orderType={order.orderType}
        />
      </div>
    </article>
  );
}
