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
      iconBg: "bg-orange-50",
      iconText: "text-orange-600",
    },
    {
      label: "Preparando",
      value: preparing,
      icon: "🍳",
      description: "En cocina",
      iconBg: "bg-amber-50",
      iconText: "text-amber-600",
    },
    {
      label: "En reparto",
      value: outForDelivery,
      icon: "🛵",
      description: "En camino",
      iconBg: "bg-blue-50",
      iconText: "text-blue-600",
    },
    {
      label: "Ventas de hoy",
      value: `${salesToday.toFixed(2)} €`,
      icon: "💰",
      description: "Pedidos recibidos hoy",
      iconBg: "bg-emerald-50",
      iconText: "text-emerald-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                {stat.label}
              </p>

              <p className="mt-2 text-3xl font-black tracking-tight text-zinc-950">
                {stat.value}
              </p>

              <p className="mt-1 text-xs font-medium text-zinc-500">
                {stat.description}
              </p>
            </div>

            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.iconBg} ${stat.iconText} text-xl shadow-sm`}
            >
              {stat.icon}
            </div>
          </div>

          <div className="mt-4 h-1 overflow-hidden rounded-full bg-zinc-100">
            <div
              className={`h-full w-1/3 rounded-full ${stat.iconBg}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
