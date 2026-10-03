import { db } from "@/src/lib/db";
import MenuClient from "./MenuClient";

export default async function Home() {
  const categories = await db.category.findMany({
    where: {
      restaurant: {
        slug: "RESTAURANTE-DEMO",
      },
    },
    include: {
      products: {
        where: {
          isAvailable: true,
        },
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
    orderBy: {
      sortOrder: "asc",
    },
  });

  const restaurant = await db.restaurant.findUnique({
    where: {
      slug: "RESTAURANTE-DEMO",
    },
  });

  const categoriesForClient = categories.map((category) => ({
    ...category,
    products: category.products.map((product) => ({
      ...product,
      price: Number(product.price),
    })),
  }));

  return (
    <MenuClient
      restaurantName={restaurant?.name ?? "Tu Restaurante"}
      restaurantSlug={restaurant?.slug ?? "RESTAURANTE-DEMO"}
      categories={categoriesForClient}
      isOpen={true}
    />
  );
}
