"use client";

import { useEffect, useMemo, useState } from "react";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
};

type Category = {
  id: string;
  name: string;
  products: Product[];
};

type CartItem = Product & {
  quantity: number;
};

export default function MenuClient({
  restaurantName,
  restaurantSlug,
  categories,
  isOpen,
}: {
  restaurantName: string;
  restaurantSlug: string;
  categories: Category[];
  isOpen: boolean;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(
    categories[0]?.id ?? ""
  );

  useEffect(() => {
    const savedCart = localStorage.getItem("restaurant-cart");

    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {
        localStorage.removeItem("restaurant-cart");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("restaurant-cart", JSON.stringify(cart));
  }, [cart]);

  function addToCart(product: Product) {
    if (!isOpen) return;

    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });
  }

  function removeFromCart(productId: string) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartTotal = cart.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0
  );

  const activeCategoryProducts = useMemo(() => {
    return categories.find((category) => category.id === activeCategory)
      ?.products ?? [];
  }, [categories, activeCategory]);

  const featuredProduct =
    categories
      .flatMap((category) => category.products)
      .find((product) => product.imageUrl) ??
    categories.flatMap((category) => category.products)[0] ??
    null;

  function scrollToCategory(categoryId: string) {
    setActiveCategory(categoryId);

    document
      .getElementById(`category-${categoryId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-zinc-950">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="truncate text-lg font-black tracking-tight">
              {restaurantName}
            </p>

            <div className="mt-0.5 flex items-center gap-2 text-xs font-medium text-zinc-500">
              <span
                className={`h-2 w-2 rounded-full ${
                  isOpen ? "bg-emerald-500" : "bg-red-500"
                }`}
              />

              {isOpen ? "Abierto ahora" : "Cerrado"}
            </div>
          </div>

          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 rounded-full bg-zinc-950 px-4 py-2.5 text-sm font-bold text-white shadow-lg transition hover:scale-[1.02] active:scale-95"
          >
            <span>🛒</span>
            <span>Carrito</span>

            {cartCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-black">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-zinc-950 text-white">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-red-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-300 backdrop-blur">
              <span
                className={`h-2 w-2 rounded-full ${
                  isOpen ? "bg-emerald-400" : "bg-red-400"
                }`}
              />
              {isOpen ? "Pedidos disponibles" : "Pedidos cerrados"}
            </div>

            <h1 className="text-5xl font-black leading-[0.95] tracking-[-0.04em] sm:text-7xl">
              {restaurantName}
              <span className="mt-2 block text-red-500">a tu manera.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg">
              Elige tus favoritos y disfruta de una experiencia de pedido
              rápida, sencilla y hecha para ti.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-zinc-300">
                ⭐ 4.9
              </div>

              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-zinc-300">
                ⏱️ 20–30 min
              </div>

              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-zinc-300">
                🔥 Favoritos
              </div>
            </div>

            <button
              onClick={() =>
                document
                  .getElementById("menu")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="mt-9 rounded-full bg-white px-7 py-4 text-sm font-black text-zinc-950 shadow-2xl transition hover:bg-red-500 hover:text-white active:scale-95"
            >
              Explorar menú ↓
            </button>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="absolute inset-8 rounded-[3rem] bg-red-500/20 blur-3xl" />

            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-zinc-900">
                {featuredProduct?.imageUrl ? (
                  <img
                    src={featuredProduct.imageUrl}
                    alt={featuredProduct.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-red-950 via-zinc-900 to-black">
                    <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-red-500/30 blur-3xl" />
                    <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-orange-500/20 blur-3xl" />

                    <div className="relative flex h-full flex-col items-center justify-center px-8 text-center">
                      <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/5 text-5xl shadow-2xl backdrop-blur">
                        🍽️
                      </div>

                      <p className="text-xs font-black uppercase tracking-[0.2em] text-red-400">
                        Hecho para ti
                      </p>

                      <p className="mt-3 max-w-xs text-2xl font-black text-white">
                        Descubre nuestros favoritos
                      </p>

                      <p className="mt-2 text-sm text-zinc-400">
                        Añade tus productos favoritos y disfruta del pedido.
                      </p>
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                <div className="absolute left-5 top-5 rounded-full bg-white px-4 py-2 text-xs font-black text-zinc-950 shadow-xl">
                  🔥 Más pedido
                </div>

                {featuredProduct && (
                  <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-white/70">
                        Recomendado
                      </p>

                      <p className="mt-1 text-2xl font-black text-white">
                        {featuredProduct.name}
                      </p>
                    </div>

                    <div className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-black text-zinc-950">
                      {Number(featuredProduct.price).toFixed(2)} €
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY NAV */}
      <div className="sticky top-[65px] z-40 border-b border-black/5 bg-[#f7f7f5]/95 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl overflow-x-auto px-4 py-3 sm:px-6">
          <div className="flex w-max gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => scrollToCategory(category.id)}
                className={`rounded-full px-4 py-2.5 text-sm font-bold transition ${
                  activeCategory === category.id
                    ? "bg-zinc-950 text-white shadow-md"
                    : "bg-white text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MENU */}
      <main id="menu" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        {categories.map((category) => (
          <section
            key={category.id}
            id={`category-${category.id}`}
            className="scroll-mt-36 mb-14"
          >
            <div className="mb-6">
              <p className="mb-1 text-xs font-black uppercase tracking-[0.18em] text-red-500">
                Selección
              </p>

              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                {category.name}
              </h2>
            </div>

            {category.products.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
                No hay productos disponibles en esta categoría.
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {category.products.map((product) => {
                  const cartItem = cart.find((item) => item.id === product.id);

                  return (
                    <article
                      key={product.id}
                      className="group overflow-hidden rounded-[1.75rem] border border-black/5 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="relative flex h-full items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-100 via-white to-zinc-200">
                            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-red-500/10 blur-2xl" />
                            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-orange-500/10 blur-2xl" />

                            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white text-4xl shadow-lg">
                              🍽️
                            </div>
                          </div>
                        )}

                        <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-sm font-black shadow-lg backdrop-blur">
                          {Number(product.price).toFixed(2)} €
                        </div>

                        {cartItem && (
                          <div className="absolute bottom-4 left-4 rounded-full bg-zinc-950 px-3 py-1.5 text-xs font-black text-white shadow-xl">
                            {cartItem.quantity} en tu pedido
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => addToCart(product)}
                          disabled={!isOpen}
                          aria-label={`Añadir ${product.name}`}
                          className={`absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full text-2xl font-light shadow-xl transition active:scale-90 ${
                            isOpen
                              ? "bg-white text-zinc-950 hover:scale-105 hover:bg-red-500 hover:text-white"
                              : "cursor-not-allowed bg-zinc-200 text-zinc-400"
                          }`}
                        >
                          +
                        </button>
                      </div>

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="text-lg font-black tracking-tight">
                              {product.name}
                            </h3>

                            {product.description && (
                              <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500">
                                {product.description}
                              </p>
                            )}
                          </div>

                          <p className="shrink-0 text-sm font-black text-red-500 sm:hidden">
                            {Number(product.price).toFixed(2)} €
                          </p>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                            {isOpen ? "Disponible ahora" : "No disponible"}
                          </span>

                          {isOpen && (
                            <button
                              type="button"
                              onClick={() => addToCart(product)}
                              className="text-sm font-black text-zinc-950 transition hover:text-red-500"
                            >
                              Añadir +
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        ))}
      </main>

      {/* FLOATING CART */}
      {cartCount > 0 && !cartOpen && (
        <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg">
          <button
            onClick={() => setCartOpen(true)}
            className="flex w-full items-center justify-between rounded-2xl bg-zinc-950 px-5 py-4 text-white shadow-2xl transition hover:bg-red-500 active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                🛒
              </div>

              <div className="text-left">
                <p className="text-xs font-medium text-zinc-400">
                  {cartCount} {cartCount === 1 ? "producto" : "productos"}
                </p>
                <p className="font-black">Ver mi pedido</p>
              </div>
            </div>

            <span className="font-black">{cartTotal.toFixed(2)} €</span>
          </button>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-black/5 bg-white px-5 py-10 text-center">
        <p className="font-black">{restaurantName}</p>
        <p className="mt-2 text-sm text-zinc-500">
          Pedidos online · Una experiencia sencilla y rápida
        </p>
      </footer>

      {/* CART DRAWER */}
      {cartOpen && (
        <div className="fixed inset-0 z-[100]">
          <button
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
            aria-label="Cerrar carrito"
          />

          <aside className="absolute bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto rounded-t-[2rem] bg-white p-5 shadow-2xl sm:bottom-auto sm:left-auto sm:top-0 sm:h-full sm:max-h-none sm:w-full sm:max-w-md sm:rounded-none sm:rounded-l-[2rem] sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.15em] text-red-500">
                  Tu pedido
                </p>

                <h2 className="mt-1 text-2xl font-black">Carrito</h2>
              </div>

              <button
                onClick={() => setCartOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-lg transition hover:bg-zinc-200"
              >
                ✕
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="mt-20 text-center">
                <div className="text-6xl">🛒</div>
                <p className="mt-5 text-lg font-black">
                  Tu carrito está vacío
                </p>
                <p className="mt-2 text-sm text-zinc-500">
                  Añade algo delicioso para empezar.
                </p>
              </div>
            ) : (
              <>
                <div className="mt-8 space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl bg-zinc-50 p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate font-black">{item.name}</p>

                          <p className="mt-1 text-sm text-zinc-500">
                            {Number(item.price).toFixed(2)} € ·{" "}
                            {item.quantity}{" "}
                            {item.quantity === 1 ? "unidad" : "unidades"}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-lg font-bold shadow-sm"
                          >
                            −
                          </button>

                          <span className="w-5 text-center font-black">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() => addToCart(item)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 text-lg font-bold text-white"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 border-t border-zinc-200 pt-6">
                  <div className="flex items-end justify-between">
                    <span className="text-sm font-medium text-zinc-500">
                      Subtotal
                    </span>

                    <span className="text-2xl font-black">
                      {cartTotal.toFixed(2)} €
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (!isOpen) return;

                      window.location.href = `/checkout?restaurant=${restaurantSlug}`;
                    }}
                    disabled={!isOpen}
                    className={`mt-5 w-full rounded-2xl py-4 font-black text-white shadow-lg transition active:scale-[0.98] ${
                      isOpen
                        ? "bg-red-500 hover:bg-red-600"
                        : "cursor-not-allowed bg-zinc-300"
                    }`}
                  >
                    {isOpen
                      ? "Continuar con mi pedido →"
                      : "🔴 Pedidos cerrados"}
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
