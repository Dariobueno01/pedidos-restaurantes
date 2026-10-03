"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import ConfirmButton from "./ConfirmButton";

type CartItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  quantity: number;
};

type RestaurantSettings = {
  name: string;
  minimumOrder: number | null;
  deliveryFee: number | null;
};

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const restaurantSlug = searchParams.get("restaurant");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [orderType, setOrderType] = useState<"DELIVERY" | "PICKUP">(
    "DELIVERY"
  );

  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD">(
    "CASH"
  );

  const [restaurantSettings, setRestaurantSettings] =
    useState<RestaurantSettings | null>(null);

  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState("");

  useEffect(() => {
    const savedCart = localStorage.getItem("restaurant-cart");

    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);

        const normalizedCart = parsedCart.map((item: CartItem) => ({
          ...item,
          price: Number(item.price),
          quantity: Number(item.quantity),
        }));

        setCart(normalizedCart);
      } catch {
        localStorage.removeItem("restaurant-cart");
      }
    }
  }, []);

  useEffect(() => {
    if (!restaurantSlug) return;

    async function loadRestaurantSettings() {
      try {
        setSettingsLoading(true);
        setSettingsError("");

        const response = await fetch(
          `/api/restaurants?slug=${encodeURIComponent(restaurantSlug!)}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "No se pudo cargar la configuración."
          );
        }

        setRestaurantSettings(data.restaurant);

        // Si el restaurante no ofrece delivery,
        // seleccionamos automáticamente recogida.
        if (data.restaurant.deliveryFee === null) {
          setOrderType("PICKUP");
        }
      } catch (error) {
        console.error("Error cargando restaurante:", error);
        setSettingsError(
          "No se pudo cargar la información del restaurante."
        );
      } finally {
        setSettingsLoading(false);
      }
    }

    loadRestaurantSettings();
  }, [restaurantSlug]);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const minimumOrder = restaurantSettings?.minimumOrder ?? null;

  const deliveryFee =
    orderType === "DELIVERY" && restaurantSettings?.deliveryFee !== null
      ? restaurantSettings?.deliveryFee ?? 0
      : 0;

  const finalTotal = subtotal + deliveryFee;

  const minimumOrderReached =
    minimumOrder === null || subtotal >= minimumOrder;

  const deliveryAvailable = restaurantSettings?.deliveryFee !== null;

  if (!restaurantSlug) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-100 p-6">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-zinc-900">
            Restaurante no especificado
          </h1>

          <p className="mt-2 text-zinc-600">
            Vuelve al menú e inténtalo nuevamente.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 pb-32">
      <header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-7">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-500">
              Tu pedido
            </p>
            <h1 className="mt-1 text-xl font-black tracking-tight text-zinc-950 sm:text-2xl">
              Finalizar pedido
            </h1>
          </div>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="rounded-full bg-zinc-100 px-4 py-2.5 text-sm font-bold text-zinc-700 transition hover:bg-zinc-200 active:scale-95"
          >
            ← Volver
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-7 sm:px-7 sm:py-10">
        {settingsLoading && (
          <div className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm">
            Cargando información del restaurante...
          </div>
        )}

        {settingsError && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
            {settingsError}
          </div>
        )}

        {!settingsLoading && !settingsError && (
          <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">

            <div className="space-y-6">

              {/* PASO 1 */}
              <section className="rounded-3xl border border-zinc-100 bg-white p-5 shadow-sm sm:p-7">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-red-500">
                  Paso 1
                </p>

                <h2 className="mt-1 text-2xl font-black tracking-tight text-zinc-950">
                  ¿Cómo quieres recibirlo?
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  Elige cómo quieres recibir tu pedido.
                </p>

                <div
                  className={`mt-6 grid gap-3 ${
                    deliveryAvailable ? "sm:grid-cols-2" : "sm:grid-cols-1"
                  }`}
                >
                  {deliveryAvailable && (
                    <button
                      type="button"
                      onClick={() => setOrderType("DELIVERY")}
                      className={`rounded-2xl border-2 p-5 text-left transition active:scale-[0.99] ${
                        orderType === "DELIVERY"
                          ? "border-red-500 bg-red-50"
                          : "border-zinc-200 bg-white hover:border-zinc-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-2xl">
                          🛵
                        </span>

                        {orderType === "DELIVERY" && (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-black text-white">
                            ✓
                          </span>
                        )}
                      </div>

                      <p className="mt-4 font-black text-zinc-950">
                        Entrega a domicilio
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        Recibe tu pedido en casa.
                      </p>

                      <p className="mt-3 text-sm font-black text-zinc-950">
                        + {restaurantSettings?.deliveryFee?.toFixed(2)} € de envío
                      </p>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setOrderType("PICKUP")}
                    className={`rounded-2xl border-2 p-5 text-left transition active:scale-[0.99] ${
                      orderType === "PICKUP"
                        ? "border-red-500 bg-red-50"
                        : "border-zinc-200 bg-white hover:border-zinc-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-2xl">
                        🏪
                      </span>

                      {orderType === "PICKUP" && (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-black text-white">
                          ✓
                        </span>
                      )}
                    </div>

                    <p className="mt-4 font-black text-zinc-950">
                      Recoger en restaurante
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      Recoge tu pedido cuando esté listo.
                    </p>

                    <p className="mt-3 text-sm font-black text-emerald-600">
                      Sin coste de envío
                    </p>
                  </button>
                </div>
              </section>

              {/* PASO 2 */}
              <section className="rounded-3xl border border-zinc-100 bg-white p-5 shadow-sm sm:p-7">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-red-500">
                  Paso 2
                </p>

                <h2 className="mt-1 text-2xl font-black tracking-tight text-zinc-950">
                  Tus datos
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  Introduce los datos necesarios para tu pedido.
                </p>

                <div className="mt-6 space-y-4">

                  <div>
                    <label className="mb-2 block text-sm font-bold text-zinc-800">
                      Nombre
                    </label>

                    <input
                      type="text"
                      placeholder="Tu nombre"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 outline-none transition placeholder:text-zinc-400 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-zinc-800">
                      Teléfono
                    </label>

                    <input
                      type="tel"
                      placeholder="600 000 000"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 outline-none transition placeholder:text-zinc-400 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10"
                    />
                  </div>

                  {orderType === "DELIVERY" && (
                    <div>
                      <label className="mb-2 block text-sm font-bold text-zinc-800">
                        Dirección de entrega
                      </label>

                      <input
                        type="text"
                        placeholder="Calle, número, piso..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 outline-none transition placeholder:text-zinc-400 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10"
                      />
                    </div>
                  )}

                  <div>
                    <label className="mb-2 block text-sm font-bold text-zinc-800">
                      Observaciones
                      <span className="ml-2 font-normal text-zinc-400">
                        opcional
                      </span>
                    </label>

                    <textarea
                      placeholder="Ej: llamar al llegar..."
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 outline-none transition placeholder:text-zinc-400 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10"
                    />
                  </div>
                </div>
              </section>

              {/* PASO 3 */}
              <section className="rounded-3xl border border-zinc-100 bg-white p-5 shadow-sm sm:p-7">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-red-500">
                  Paso 3
                </p>

                <h2 className="mt-1 text-2xl font-black tracking-tight text-zinc-950">
                  ¿Cómo quieres pagar?
                </h2>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("CASH")}
                    className={`rounded-2xl border-2 p-5 text-left transition active:scale-[0.99] ${
                      paymentMethod === "CASH"
                        ? "border-red-500 bg-red-50"
                        : "border-zinc-200 bg-white hover:border-zinc-300"
                    }`}
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-2xl">
                      💵
                    </span>

                    <p className="mt-4 font-black text-zinc-950">
                      Efectivo
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      Pagar al recibir el pedido.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("CARD")}
                    className={`rounded-2xl border-2 p-5 text-left transition active:scale-[0.99] ${
                      paymentMethod === "CARD"
                        ? "border-red-500 bg-red-50"
                        : "border-zinc-200 bg-white hover:border-zinc-300"
                    }`}
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-2xl">
                      💳
                    </span>

                    <p className="mt-4 font-black text-zinc-950">
                      Tarjeta
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      Pago con tarjeta.
                    </p>
                  </button>

                </div>
              </section>
            </div>

            {/* RESUMEN */}
            <aside className="lg:sticky lg:top-24">
              <section className="overflow-hidden rounded-3xl border border-zinc-100 bg-white shadow-sm">

                <div className="border-b border-zinc-100 p-5 sm:p-6">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-red-500">
                    Resumen
                  </p>

                  <h2 className="mt-1 text-2xl font-black tracking-tight text-zinc-950">
                    Tu pedido
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    {cart.length} {cart.length === 1 ? "producto" : "productos"}
                  </p>
                </div>

                <div className="max-h-[360px] space-y-3 overflow-y-auto p-5 sm:p-6">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-2xl bg-zinc-50 p-3"
                    >
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xl">
                            🍽️
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-black text-zinc-950">
                          {item.name}
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                          {item.quantity} × {item.price.toFixed(2)} €
                        </p>
                      </div>

                      <p className="shrink-0 text-sm font-black text-zinc-950">
                        {(item.price * item.quantity).toFixed(2)} €
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-zinc-100 p-5 sm:p-6">

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-zinc-500">
                      <span>Subtotal</span>
                      <span className="font-semibold text-zinc-900">
                        {subtotal.toFixed(2)} €
                      </span>
                    </div>

                    <div className="flex justify-between text-sm text-zinc-500">
                      <span>
                        {orderType === "DELIVERY" ? "Envío" : "Recogida"}
                      </span>

                      <span className="font-semibold text-zinc-900">
                        {orderType === "DELIVERY"
                          ? `${deliveryFee.toFixed(2)} €`
                          : "0,00 €"}
                      </span>
                    </div>

                    <div className="border-t border-zinc-100 pt-4">
                      <div className="flex items-end justify-between gap-4">
                        <span className="font-bold text-zinc-500">
                          Total
                        </span>

                        <span className="text-3xl font-black tracking-tight text-zinc-950">
                          {finalTotal.toFixed(2)} €
                        </span>
                      </div>
                    </div>
                  </div>

                  {minimumOrder !== null && (
                    <div
                      className={`mt-5 rounded-2xl p-4 text-sm ${
                        minimumOrderReached
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {minimumOrderReached ? (
                        <p className="font-bold">
                          ✓ Pedido mínimo de {minimumOrder.toFixed(2)} € alcanzado
                        </p>
                      ) : (
                        <div>
                          <p className="font-black">
                            Te faltan {(minimumOrder - subtotal).toFixed(2)} €
                          </p>

                          <p className="mt-1">
                            El pedido mínimo es de {minimumOrder.toFixed(2)} €.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {!minimumOrderReached && (
                    <div className="mt-4 rounded-2xl bg-zinc-100 p-4 text-center text-sm font-semibold text-zinc-500">
                      Añade más productos para continuar.
                    </div>
                  )}

                  {minimumOrderReached && (
                    <div className="mt-5">
                      <ConfirmButton
                        restaurantSlug={restaurantSlug}
                        customerName={customerName}
                        customerPhone={customerPhone}
                        address={address}
                        notes={notes}
                        orderType={orderType}
                        paymentMethod={paymentMethod}
                        cart={cart.map((item) => ({
                          id: item.id,
                          quantity: item.quantity,
                        }))}
                      />
                    </div>
                  )}

                </div>
              </section>

              <p className="mt-4 text-center text-xs text-zinc-400">
                Revisa tus datos antes de confirmar el pedido.
              </p>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
