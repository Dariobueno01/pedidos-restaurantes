import { redirect } from "next/navigation";

import { db } from "@/src/lib/db";
import { createSupabaseServerClient } from "@/src/lib/supabase-server-auth";

import RestaurantActions from "./RestaurantActions";
import AdminActions from "./AdminActions";
import CreateRestaurantForm from "./CreateRestaurantForm";
import CreateCategoryForm from "./CreateCategoryForm";
import CreateProductForm from "./CreateProductForm";
import ProductActions from "./ProductActions";
import CategoryActions from "./CategoryActions";

export default async function SuperAdminPage() {
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
  });

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  const categories = await db.category.findMany({
    include: {
      restaurant: true,
      products: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  const restaurants = await db.restaurant.findMany({
    include: {
      users: {
        where: {
          role: "RESTAURANT_ADMIN",
        },
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
      _count: {
        select: {
          orders: true,
        },
      },
      orders: {
        select: {
          total: true,
          createdAt: true,
          status: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-zinc-100 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-3xl bg-zinc-950 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-6 px-6 py-7 sm:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500 text-2xl shadow-lg">
                ⚡
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-red-400">
                  Panel de control
                </p>
                <h1 className="mt-1 text-3xl font-black tracking-tight text-white">
                  Super Admin
                </h1>
                <p className="mt-1 text-sm text-zinc-400">
                  Gestiona toda tu plataforma desde un solo lugar.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Acceso
              </p>
              <p className="mt-1 font-black text-white">
                Administrador principal
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 bg-zinc-900 px-6 py-3 sm:px-8">
            <p className="text-xs font-medium text-zinc-500">
              Gestiona restaurantes, administradores, menús y operaciones.
            </p>
          </div>
        </div>

        <CreateRestaurantForm />

        <CreateCategoryForm
          restaurants={restaurants.map((restaurant) => ({
            name: restaurant.name,
            slug: restaurant.slug,
          }))}
        />

        <CreateProductForm
          categories={categories.map((category) => ({
            id: category.id,
            name: category.name,
            restaurantName: category.restaurant.name,
          }))}
        />

        <div className="mt-8 grid gap-4">
          {restaurants.map((restaurant) => {
            const restaurantCategories = categories.filter(
              (category) => category.restaurantId === restaurant.id
            );

            const restaurantAdmin = restaurant.users[0];

            const totalSales = restaurant.orders.reduce(
              (sum, order) => sum + Number(order.total),
              0
            );

            const today = new Date();
            const startOfToday = new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate()
            );

            const ordersToday = restaurant.orders.filter(
              (order) => new Date(order.createdAt) >= startOfToday
            );

            const salesToday = ordersToday.reduce(
              (sum, order) => sum + Number(order.total),
              0
            );

            return (
              <div
                key={restaurant.id}
                className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"
              >
                <div className="bg-zinc-950 px-6 py-6 sm:px-7">
                  <div className="flex flex-wrap items-start justify-between gap-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500 text-2xl text-white shadow-lg">
                        🍽️
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-2xl font-black tracking-tight text-white">
                            {restaurant.name}
                          </h2>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${
                              restaurant.isActive
                                ? "bg-emerald-500/15 text-emerald-300"
                                : "bg-red-500/15 text-red-300"
                            }`}
                          >
                            {restaurant.isActive ? "● Activo" : "● Inactivo"}
                          </span>
                        </div>

                        <p className="mt-1 text-sm font-medium text-zinc-400">
                          /r/{restaurant.slug}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-left sm:text-right">
                      <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                        Pedidos
                      </p>
                      <p className="mt-1 text-2xl font-black text-white">
                        {restaurant._count.orders}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-6 sm:px-7">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-zinc-400">
                        Administrador
                      </p>
                      <p className="mt-1 text-sm font-semibold text-zinc-800">
                        👤 {restaurantAdmin?.email ?? "Sin administrador"}
                      </p>

                      <AdminActions
                        admin={
                          restaurantAdmin
                            ? {
                                id: restaurantAdmin.id,
                                email: restaurantAdmin.email,
                              }
                            : null
                        }
                      />

                      <a
                        href={`/r/${restaurant.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center rounded-lg bg-red-500 px-3 py-2 text-sm font-bold text-white hover:bg-red-600"
                      >
                        🌐 Ver restaurante
                      </a>
                    </div>

                    <RestaurantActions
                      restaurant={{
                        id: restaurant.id,
                        name: restaurant.name,
                        slug: restaurant.slug,
                        isActive: restaurant.isActive,
                      }}
                    />
                  </div>

                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="group rounded-2xl border border-zinc-200 bg-zinc-50/70 p-5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-black uppercase tracking-wider text-zinc-400">
                        Pedidos totales
                      </p>
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 text-sm text-white">
                        📦
                      </span>
                    </div>
                    <p className="mt-4 text-3xl font-black tracking-tight text-zinc-950">
                      {restaurant._count.orders}
                    </p>
                    <p className="mt-1 text-xs font-medium text-zinc-400">
                      Pedidos registrados
                    </p>
                  </div>

                  <div className="group rounded-2xl border border-zinc-200 bg-zinc-50/70 p-5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-black uppercase tracking-wider text-zinc-400">
                        Ventas totales
                      </p>
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-sm text-white">
                        💰
                      </span>
                    </div>
                    <p className="mt-4 text-3xl font-black tracking-tight text-zinc-950">
                      {totalSales.toFixed(2)} €
                    </p>
                    <p className="mt-1 text-xs font-medium text-zinc-400">
                      Facturación acumulada
                    </p>
                  </div>

                  <div className="group rounded-2xl border border-zinc-200 bg-zinc-50/70 p-5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-black uppercase tracking-wider text-zinc-400">
                        Pedidos de hoy
                      </p>
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 text-sm text-white">
                        📅
                      </span>
                    </div>
                    <p className="mt-4 text-3xl font-black tracking-tight text-zinc-950">
                      {ordersToday.length}
                    </p>
                    <p className="mt-1 text-xs font-medium text-zinc-400">
                      Actividad de hoy
                    </p>
                  </div>

                  <div className="group rounded-2xl border border-zinc-200 bg-zinc-50/70 p-5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-black uppercase tracking-wider text-zinc-400">
                        Ventas de hoy
                      </p>
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500 text-sm text-white">
                        💶
                      </span>
                    </div>
                    <p className="mt-4 text-3xl font-black tracking-tight text-zinc-950">
                      {salesToday.toFixed(2)} €
                    </p>
                    <p className="mt-1 text-xs font-medium text-zinc-400">
                      Facturación de hoy
                    </p>
                  </div>
                </div>

                <div className="mt-7 border-t border-zinc-200 pt-7">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-red-500">
                        Catálogo
                      </p>
                      <h3 className="mt-1 text-2xl font-black tracking-tight text-zinc-950">
                        Menú
                      </h3>
                      <p className="mt-1 text-sm font-medium text-zinc-500">
                        Gestiona categorías y productos de este restaurante.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                      <p className="text-xs font-black uppercase tracking-wider text-zinc-400">
                        Categorías
                      </p>
                      <p className="mt-1 text-xl font-black text-zinc-950">
                        {restaurantCategories.length}
                      </p>
                    </div>
                  </div>

                  {restaurantCategories.length === 0 ? (
                    <div className="mt-5 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-5 py-6">
                      <p className="text-sm font-semibold text-zinc-500">
                        Este restaurante todavía no tiene categorías.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-5 space-y-5">
                      {restaurantCategories.map((category) => (
                        <div
                          key={category.id}
                          className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50/70"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-white px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 text-sm text-white">
                                🍽️
                              </div>
                              <div>
                                <p className="text-xs font-black uppercase tracking-wider text-zinc-400">
                                  Categoría
                                </p>
                                <h4 className="mt-0.5 font-black text-zinc-950">
                                  {category.name}
                                </h4>
                              </div>
                            </div>

                            <CategoryActions
                              category={{
                                id: category.id,
                                name: category.name,
                                productCount: category.products.length,
                              }}
                            />
                          </div>

                          {category.products.length === 0 ? (
                            <p className="mt-2 text-sm text-zinc-500">
                              No hay productos en esta categoría.
                            </p>
                          ) : (
                            <div className="mt-3 space-y-3">
                              {category.products.map((product) => (
                                <div
                                  key={product.id}
                                  className="rounded-xl border border-zinc-200 bg-white p-4"
                                >
                                  <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                      <h5 className="font-bold text-zinc-900">
                                        {product.name}
                                      </h5>

                                      {product.description && (
                                        <p className="mt-1 text-sm text-zinc-500">
                                          {product.description}
                                        </p>
                                      )}
                                    </div>

                                    <p className="font-bold text-red-500">
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
              </div>
            );
          })}

          {restaurants.length === 0 && (
            <div className="rounded-2xl bg-white p-6">
              No hay restaurantes todavía.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
