type Props = {
  pending: number;
  preparing: number;
  outForDelivery: number;
  salesToday: number;
};

export default function OrderStats({
  pending,
  preparing,
  outForDelivery,
  salesToday,
}: Props) {
  const stats = [
    {
      label: "Pendientes",
      value: pending,
      icon: "🟠",
      description: "Requieren atención",
    },
    {
      label: "Preparando",
      value: preparing,
      icon: "🍳",
      description: "En cocina",
    },
    {
      label: "En reparto",
      value: outForDelivery,
      icon: "🛵",
      description: "En camino",
    },
    {
      label: "Ventas de hoy",
      value: `${salesToday.toFixed(2)} €`,
      icon: "💰",
      description: "Pedidos recibidos hoy",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl bg-white p-5 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500">
                {stat.label}
              </p>

              <p className="mt-2 text-3xl font-bold text-zinc-900">
                {stat.value}
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                {stat.description}
              </p>
            </div>

            <span className="text-2xl">{stat.icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
