"use client";

import { useState } from "react";

type RestaurantSettingsProps = {
  restaurant: {
    id: string;
    name: string;
    address: string | null;
    phone: string | null;
    minimumOrder: number | null;
    deliveryFee: number | null;
    isOpen: boolean;
    openingTime: string | null;
    closingTime: string | null;
  };
};

export default function RestaurantSettings({
  restaurant,
}: RestaurantSettingsProps) {
  const [address, setAddress] = useState(restaurant.address ?? "");
  const [phone, setPhone] = useState(restaurant.phone ?? "");
  const [minimumOrder, setMinimumOrder] = useState(
    restaurant.minimumOrder?.toString() ?? ""
  );
  const [deliveryFee, setDeliveryFee] = useState(
    restaurant.deliveryFee?.toString() ?? ""
  );
  const [isOpen, setIsOpen] = useState(restaurant.isOpen);
  const [openingTime, setOpeningTime] = useState(
    restaurant.openingTime ?? ""
  );
  const [closingTime, setClosingTime] = useState(
    restaurant.closingTime ?? ""
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const saveSettings = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/restaurant-settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: address.trim() || null,
          phone: phone.trim() || null,
          minimumOrder: minimumOrder
            ? Number(minimumOrder)
            : null,
          deliveryFee: deliveryFee
            ? Number(deliveryFee)
            : null,
          isOpen,
          openingTime: openingTime || null,
          closingTime: closingTime || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "No se pudieron guardar los cambios.");
        return;
      }

      setMessage("✅ Configuración guardada correctamente.");

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

  return (
    <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-zinc-900">
        ⚙️ Configuración del restaurante
      </h2>

      <p className="mt-2 text-zinc-600">
        Configura la información que podrán consultar tus clientes.
      </p>

      <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-bold text-zinc-900">
              🏪 Estado del restaurante
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              Controla si los clientes pueden realizar pedidos.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`rounded-xl px-5 py-3 font-bold transition ${
              isOpen
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-red-100 text-red-700 hover:bg-red-200"
            }`}
          >
            {isOpen ? "🟢 Abierto" : "🔴 Cerrado"}
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold text-zinc-700">
            🕐 Hora de apertura
          </label>
          <input
            type="time"
            value={openingTime}
            onChange={(e) => setOpeningTime(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-zinc-700">
            🕐 Hora de cierre
          </label>
          <input
            type="time"
            value={closingTime}
            onChange={(e) => setClosingTime(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-900"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-semibold text-zinc-700">
            📍 Dirección
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Ej. Calle Mayor 25, Murcia"
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-zinc-700">
            📞 Teléfono
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ej. 600 123 456"
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-zinc-700">
            💶 Pedido mínimo
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={minimumOrder}
            onChange={(e) => setMinimumOrder(e.target.value)}
            placeholder="Ej. 10"
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-zinc-700">
            🛵 Coste de envío
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={deliveryFee}
            onChange={(e) => setDeliveryFee(e.target.value)}
            placeholder="Ej. 2.50"
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-900"
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={saveSettings}
          disabled={loading}
          className="rounded-xl bg-zinc-900 px-5 py-3 font-bold text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar configuración"}
        </button>

        {message && (
          <p className="text-sm font-medium text-zinc-600">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
