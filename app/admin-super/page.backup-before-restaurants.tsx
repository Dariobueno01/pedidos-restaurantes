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
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-zinc-900">
                      {restaurant.name}
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                      Slug: {restaurant.slug}
                    </p>

                    <div className="mt-3 space-y-1 text-sm">
                      <p className="text-zinc-700">
                        👤 <span className="font-semibold">Administrador:</span>{" "}
                        {restaurantAdmin?.email ?? "Sin administrador"}
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

                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {restaurant._count.orders}
                    </p>

                    <p className="text-sm text-zinc-500">
                      pedidos
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl bg-zinc-50 p-4">
                    <p className="text-sm text-zinc-500">📦 Pedidos totales</p>
                    <p className="mt-1 text-2xl font-bold text-zinc-900">
                      {restaurant._count.orders}
                    </p>
                  </div>

                  <div className="rounded-xl bg-zinc-50 p-4">
                    <p className="text-sm text-zinc-500">💰 Ventas totales</p>
                    <p className="mt-1 text-2xl font-bold text-zinc-900">
                      {totalSales.toFixed(2)} €
                    </p>
                  </div>

                  <div className="rounded-xl bg-zinc-50 p-4">
                    <p className="text-sm text-zinc-500">📅 Pedidos de hoy</p>
                    <p className="mt-1 text-2xl font-bold text-zinc-900">
                      {ordersToday.length}
                    </p>
                  </div>

                  <div className="rounded-xl bg-zinc-50 p-4">
                    <p className="text-sm text-zinc-500">💶 Ventas de hoy</p>
                    <p className="mt-1 text-2xl font-bold text-zinc-900">
                      {salesToday.toFixed(2)} €
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-zinc-200 pt-6">
                  <h3 className="text-lg font-bold text-zinc-900">
                    Menú
                  </h3>

                  {restaurantCategories.length === 0 ? (
                    <p className="mt-3 text-sm text-zinc-500">
                      Este restaurante todavía no tiene categorías.
                    </p>
                  ) : (
                    <div className="mt-4 space-y-5">
                      {restaurantCategories.map((category) => (
                        <div
                          key={category.id}
                          className="rounded-xl bg-zinc-50 p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <h4 className="font-bold text-zinc-900">
                              {category.name}
                            </h4>

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
