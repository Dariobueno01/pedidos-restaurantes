import { notFound } from "next/navigation";
import { db } from "@/src/lib/db";
import MenuClient from "@/app/MenuClient";
import { isRestaurantCurrentlyOpen } from "@/src/lib/restaurant-hours";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function RestaurantPage({ params }: Props) {
  const { slug } = await params;

  const restaurant = await db.restaurant.findUnique({
    where: { slug, isActive: true },
    include: {
      categories: {
        include: {
          products: {
            where: { isAvailable: true },
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!restaurant) notFound();

  const currentlyOpen = isRestaurantCurrentlyOpen({
    isOpen: restaurant.isOpen,
    openingTime: restaurant.openingTime,
    closingTime: restaurant.closingTime,
  });

  const categoriesForClient = restaurant.categories.map((category) => ({
    ...category,
    products: category.products.map((product) => ({
      ...product,
      price: Number(product.price),
    })),
  }));

  return (
    <div className="min-h-screen bg-zinc-100">
      <MenuClient
        restaurantName={restaurant.name}
        restaurantSlug={restaurant.slug}
        categories={categoriesForClient}
        isOpen={currentlyOpen}
      />
    </div>
  );
}
