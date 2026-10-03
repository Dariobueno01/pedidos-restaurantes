type RestaurantHours = {
  isOpen: boolean;
  openingTime: string | null;
  closingTime: string | null;
};

export function isRestaurantCurrentlyOpen(
  restaurant: RestaurantHours
): boolean {
  if (!restaurant.isOpen) {
    return false;
  }

  if (!restaurant.openingTime || !restaurant.closingTime) {
    return restaurant.isOpen;
  }

  const now = new Date();

  const currentTime = new Intl.DateTimeFormat("es-ES", {
    timeZone: "Europe/Madrid",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);

  const [currentHour, currentMinute] = currentTime.split(":").map(Number);
  const [openingHour, openingMinute] = restaurant.openingTime
    .split(":")
    .map(Number);
  const [closingHour, closingMinute] = restaurant.closingTime
    .split(":")
    .map(Number);

  const currentMinutes = currentHour * 60 + currentMinute;
  const openingMinutes = openingHour * 60 + openingMinute;
  const closingMinutes = closingHour * 60 + closingMinute;

  if (openingMinutes === closingMinutes) {
    return true;
  }

  if (openingMinutes < closingMinutes) {
    return (
      currentMinutes >= openingMinutes &&
      currentMinutes < closingMinutes
    );
  }

  return (
    currentMinutes >= openingMinutes ||
    currentMinutes < closingMinutes
  );
}
