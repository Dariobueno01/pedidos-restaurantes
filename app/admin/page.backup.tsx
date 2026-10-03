import { redirect } from "next/navigation";

import { db } from "@/src/lib/db";
import { createSupabaseServerClient } from "@/src/lib/supabase-server-auth";

import CategoryActions from "./CategoryActions";
import CreateCategoryForm from "./CreateCategoryForm";
import CreateProductForm from "./CreateProductForm";
import OrdersList from "./OrdersList";
import ProductActions from "./ProductActions";
import OrderStats from "./OrderStats";
import RestaurantSettings from "./RestaurantSettings";

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: {
      id: authUser.id,
    },
    include: {
      restaurant: true,
    },
  });

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-100 p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-zinc-900">
            Usuario no configurado
          </h1>
          <p className="mt-3 text-zinc-600">
            Tu cuenta existe, pero todavía no está vinculada a un restaurante.
          </p>
        </div>
      </main>
    );
  }

  if (user.role !== "RESTAURANT_ADMIN") {
    redirect("/admin-super");
  }

  if (!user.restaurant) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-100 p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-zinc-900">
            Sin restaurante asignado
          </h1>
          <p className="mt-3 text-zinc-600">
            Tu cuenta todavía no tiene un restaurante asignado.
          </p>
        </div>
      </main>
    );
  }

  if (!user.restaurant.isActive) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-100 p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-zinc-900">
            Restaurante desactivado
          </h1>
          <p className="mt-3 text-zinc-600">
            Tu restaurante está actualmente desactivado.
          </p>
        </div>
      </main>
    );
  }

  const [orders, categories] = await Promise.all([
    db.order.findMany({
      where: {
        restaurantId: user.restaurant.id,
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    db.category.findMany({
      where: {
        restaurantId: user.restaurant.id,
      },
      include: {
        products: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
      orderBy: {
        sortOrder: "asc",
      },
    }),
  ]);

  const pendingOrders = orders.filter(
    (order) => order.status === "PENDING"
  ).length;

  const preparingOrders = orders.filter(
    (order) => order.status === "PREPARING"
  ).length;

  const outForDeliveryOrders = orders.filter(
    (order) => order.status === "OUT_FOR_DELIVERY"
  ).length;

  const today = new Date().toLocaleDateString("es-ES", {
    timeZone: "Europe/Madrid",
  });

  const salesToday = orders
    .filter(
      (order) =>
        order.status !== "CANCELLED" &&
        order.createdAt.toLocaleDateString("es-ES", {
          timeZone: "Europe/Madrid",
        }) === today
    )
    .reduce((total, order) => total + Number(order.total), 0);

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-6xl px-5 py-6 sm:px-7 sm:py-8">

        {/* HEADER DEL PANEL */}
        <header className="overflow-hidden rounded-[2rem] bg-zinc-950 text-white shadow-xl">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500 text-2xl shadow-lg">
                    🍽️
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-red-400">
                      Panel del restaurante
                    </p>

                    <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
                      {user.restaurant.name}
                    </h1>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      user.restaurant.isOpen
                        ? "bg-emerald-400"
                        : "bg-red-400"
                    }`}
                  />

                  <span className="text-sm font-bold text-zinc-300">
                    {user.restaurant.isOpen
                      ? "Restaurante abierto"
                      : "Restaurante cerrado"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:min-w-[330px]">
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
                    Pendientes
                  </p>

                  <p className="mt-1 text-3xl font-black">
                    {pendingOrders}
                  </p>

                  <p className="mt-1 text-xs text-zinc-400">
                    pedidos por atender
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
                    Hoy
                  </p>

                  <p className="mt-1 text-3xl font-black">
                    {salesToday.toFixed(2)} €
                  </p>

                  <p className="mt-1 text-xs text-zinc-400">
                    ventas del día
                  </p>
                </div>
              </div>

            </div>
          </div>

          <div className="border-t border-white/10 bg-white/5 px-6 py-3 sm:px-8">
            <p className="text-xs text-zinc-400">
              Gestiona pedidos, menú y configuración desde un solo lugar.
            </p>
          </div>
        </header>

        <RestaurantSettings
          restaurant={{
            id: user.restaurant.id,
            name: user.restaurant.name,
            address: user.restaurant.address,
            phone: user.restaurant.phone,
            minimumOrder: user.restaurant.minimumOrder
              ? Number(user.restaurant.minimumOrder)
              : null,
            deliveryFee: user.restaurant.deliveryFee
              ? Number(user.restaurant.deliveryFee)
              : null,
            isOpen: user.restaurant.isOpen,
            openingTime: user.restaurant.openingTime,
            closingTime: user.restaurant.closingTime,
          }}
        />

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-zinc-900">
            Mi menú
          </h2>

          <p className="mt-2 text-zinc-600">
            Gestiona las categorías y productos de tu restaurante.
          </p>

          <CreateCategoryForm />

          <CreateProductForm
            categories={categories.map((category) => ({
              id: category.id,
              name: category.name,
            }))}
          />

          {categories.length === 0 ? (
            <p className="mt-5 text-zinc-500">
              Todavía no tienes categorías.
            </p>
          ) : (
            <div className="mt-5 space-y-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="rounded-xl border border-zinc-200 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-zinc-900">
                        {category.name}
                      </h3>
                    </div>

                    <CategoryActions
                      category={{
                        id: category.id,
                        name: category.name,
                      }}
                    />
                  </div>

                  {category.products.length === 0 ? (
                    <p className="mt-3 text-sm text-zinc-500">
                      Sin productos.
                    </p>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {category.products.map((product) => (
                        <div
                          key={product.id}
                          className="rounded-lg bg-zinc-50 p-3"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="font-semibold text-zinc-900">
                                {product.name}
                              </p>

                              {product.description && (
                                <p className="text-sm text-zinc-500">
                                  {product.description}
                                </p>
                              )}
                            </div>

                            <p className="shrink-0 font-bold text-zinc-900">
                              {Number(product.price).toFixed(2)} €
                            </p>
                          </div>

                          <ProductActions
                            product={{
                              id: product.id,
                              name: product.name,
                              description: product.description,
                              price: Number(product.price),
                              isAvailable: product.isAvailable,
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">
              Pedidos
            </h2>

            <p className="mt-1 text-sm text-zinc-600">
              Gestiona los pedidos recibidos por tu restaurante.
            </p>
          </div>

          <OrderStats
            pending={pendingOrders}
            preparing={preparingOrders}
            outForDelivery={outForDeliveryOrders}
            salesToday={salesToday}
          />

          <OrdersList
            orders={orders.map((order) => ({
              id: order.id,
              customerName: order.customerName,
              customerPhone: order.customerPhone,
              address: order.address,
              notes: order.notes,
              paymentMethod: order.paymentMethod,
              orderType: order.orderType,
              status: order.status,
              total: Number(order.total),
              createdAt: order.createdAt.toISOString(),
              items: order.items.map((item) => ({
                id: item.id,
                productName: item.productName,
                unitPrice: Number(item.unitPrice),
                quantity: item.quantity,
              })),
            }))}
          />
        </div>
      </div>
    </main>
  );
}
