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
    <main className="min-h-screen bg-zinc-100 py-10">
      <div className="mx-auto max-w-2xl px-5">
        <h1 className="text-3xl font-bold text-zinc-900">
          Finalizar pedido
        </h1>

        <p className="mt-2 text-zinc-600">
          Completa tus datos para realizar tu pedido.
        </p>

        {settingsLoading && (
          <div className="mt-6 rounded-2xl bg-white p-5 text-sm text-zinc-600 shadow-sm">
            Cargando información del restaurante...
          </div>
        )}

        {settingsError && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
            {settingsError}
          </div>
        )}

        {cart.length > 0 && (
          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-zinc-900">
              Tu pedido
            </h2>

            <div className="mt-5 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b pb-4"
                >
                  <div>
                    <p className="font-bold text-zinc-900">
                      {item.name}
                    </p>

                    <p className="text-sm text-zinc-500">
                      {item.quantity} × {item.price.toFixed(2)} €
                    </p>
                  </div>

                  <p className="font-bold text-zinc-900">
                    {(item.price * item.quantity).toFixed(2)} €
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-3 border-t pt-5">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal</span>
                <span>{subtotal.toFixed(2)} €</span>
              </div>

              {orderType === "DELIVERY" ? (
                <div className="flex justify-between text-zinc-600">
                  <span>Envío</span>
                  <span>{deliveryFee.toFixed(2)} €</span>
                </div>
              ) : (
                <div className="flex justify-between text-zinc-600">
                  <span>Recogida</span>
                  <span>0,00 €</span>
                </div>
              )}

              <div className="flex justify-between border-t pt-3 text-xl font-bold text-zinc-900">
                <span>Total</span>
                <span>{finalTotal.toFixed(2)} €</span>
              </div>
            </div>

            {minimumOrder !== null && (
              <div
                className={`mt-5 rounded-xl p-4 text-sm ${
                  minimumOrderReached
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {minimumOrderReached ? (
                  <p className="font-semibold">
                    ✅ Pedido mínimo alcanzado: {minimumOrder.toFixed(2)} €
                  </p>
                ) : (
                  <div>
                    <p className="font-bold">
                      ⚠️ Pedido mínimo: {minimumOrder.toFixed(2)} €
                    </p>

                    <p className="mt-1">
                      Te faltan{" "}
                      {(minimumOrder - subtotal).toFixed(2)} € para poder
                      realizar el pedido.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-zinc-900">
            ¿Cómo quieres recibir tu pedido?
          </h2>

          <div
            className={`mt-4 grid gap-3 ${
              deliveryAvailable ? "sm:grid-cols-2" : "sm:grid-cols-1"
            }`}
          >
            {deliveryAvailable && (
              <button
                type="button"
                onClick={() => setOrderType("DELIVERY")}
                className={`rounded-xl border-2 p-4 text-left transition ${
                  orderType === "DELIVERY"
                    ? "border-red-500 bg-red-50"
                    : "border-zinc-200 bg-white"
                }`}
              >
                <p className="font-bold">🛵 Entrega a domicilio</p>
                <p className="mt-1 text-sm text-zinc-500">
                  Recibe tu pedido en casa. Envío:{" "}
                  {restaurantSettings?.deliveryFee?.toFixed(2)} €
                </p>
              </button>
            )}

            <button
              type="button"
              onClick={() => setOrderType("PICKUP")}
              className={`rounded-xl border-2 p-4 text-left transition ${
                orderType === "PICKUP"
                  ? "border-red-500 bg-red-50"
                  : "border-zinc-200 bg-white"
              }`}
            >
              <p className="font-bold">🏪 Recoger en restaurante</p>
              <p className="mt-1 text-sm text-zinc-500">
                Recoge tu pedido en el restaurante. Sin coste de envío.
              </p>
            </button>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold text-zinc-900">
              Tus datos
            </h2>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Nombre
                </label>

                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Teléfono
                </label>

                <input
                  type="tel"
                  placeholder="600 000 000"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-red-500"
                />
              </div>

              {orderType === "DELIVERY" && (
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Dirección
                  </label>

                  <input
                    type="text"
                    placeholder="Calle, número, piso..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-red-500"
                  />
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Observaciones
                </label>

                <textarea
                  placeholder="Ej: llamar al llegar..."
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 border-t pt-6">
            <h2 className="text-xl font-bold text-zinc-900">
              ¿Cómo quieres pagar?
            </h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("CASH")}
                className={`rounded-xl border-2 p-4 text-left transition ${
                  paymentMethod === "CASH"
                    ? "border-red-500 bg-red-50"
                    : "border-zinc-200 bg-white"
                }`}
              >
                <p className="font-bold">💵 Efectivo</p>
                <p className="mt-1 text-sm text-zinc-500">
                  Pagar al recibir el pedido.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("CARD")}
                className={`rounded-xl border-2 p-4 text-left transition ${
                  paymentMethod === "CARD"
                    ? "border-red-500 bg-red-50"
                    : "border-zinc-200 bg-white"
                }`}
              >
                <p className="font-bold">💳 Tarjeta</p>
                <p className="mt-1 text-sm text-zinc-500">
                  Pago con tarjeta.
                </p>
              </button>
            </div>
          </div>

          {!settingsLoading &&
            !settingsError &&
            minimumOrderReached && (
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
            )}

          {!settingsLoading &&
            !settingsError &&
            !minimumOrderReached && (
              <div className="mt-6 rounded-xl bg-zinc-100 p-4 text-center text-sm font-semibold text-zinc-600">
                Añade productos hasta alcanzar el pedido mínimo de{" "}
                {minimumOrder?.toFixed(2)} €.
              </div>
            )}
        </div>
      </div>
    </main>
  );
}
