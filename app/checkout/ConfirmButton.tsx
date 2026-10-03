"use client";

type ConfirmButtonProps = {
  restaurantSlug: string;
  customerName: string;
  customerPhone: string;
  address: string;
  notes: string;
  orderType: "DELIVERY" | "PICKUP";
  paymentMethod: "CASH" | "CARD";
  cart: {
    id: string;
    quantity: number;
  }[];
};

export default function ConfirmButton({
  restaurantSlug,
  customerName,
  customerPhone,
  address,
  notes,
  orderType,
  paymentMethod,
  cart,
}: ConfirmButtonProps) {
  const handleConfirm = async () => {
    if (!customerName || !customerPhone) {
      alert("Completa nombre y teléfono.");
      return;
    }

    if (orderType === "DELIVERY" && !address) {
      alert("Completa la dirección de entrega.");
      return;
    }

    if (cart.length === 0) {
      alert("El carrito está vacío.");
      return;
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantSlug,
          customerName,
          customerPhone,
          address: orderType === "PICKUP" ? "RECOGIDA EN RESTAURANTE" : address,
          notes,
          orderType,
          paymentMethod,
          items: cart,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "No se pudo realizar el pedido.");
        return;
      }

      localStorage.removeItem("restaurant-cart");
      localStorage.removeItem("restaurant-slug");

      sessionStorage.setItem(
        "last-order",
        JSON.stringify({
          orderId: data.order?.id ?? data.id ?? null,
          restaurantSlug,
          orderType,
          paymentMethod,
          total: data.total ?? null,
        })
      );

      window.location.href = `/pedido-confirmado?restaurant=${encodeURIComponent(
        restaurantSlug
      )}`;
    } catch (error) {
      console.error(error);
      alert("Error de conexión. Inténtalo nuevamente.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleConfirm}
      className="mt-8 w-full rounded-xl bg-red-500 py-4 font-bold text-white hover:bg-red-600"
    >
      Confirmar pedido
    </button>
  );
}
