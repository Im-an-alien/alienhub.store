import { prisma } from "@/lib/prisma";
import { formatIQD } from "@/lib/utils";

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
    take: 100,
  });

  return (
    <div className="p-8">
      <header className="mb-6">
        <h1 className="font-display text-xl font-bold text-fog">Orders</h1>
        <p className="mt-1 text-sm text-fog-dim">
          {orders.length} orders · full status management arrives in the next phase
        </p>
      </header>

      <div className="overflow-hidden rounded-xl border border-edge">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left font-mono text-[11px] uppercase tracking-wider text-fog-dim">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-edge">
            {orders.map((o) => (
              <tr key={o.id} className="bg-card">
                <td className="px-4 py-3 font-mono text-xs text-fog">{o.orderNumber}</td>
                <td className="px-4 py-3 text-fog">{o.customerName}</td>
                <td className="px-4 py-3 text-fog-dim">{o.items.length}</td>
                <td className="px-4 py-3 text-fog">{formatIQD(o.total)}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-surface px-2 py-1 font-mono text-[10px] uppercase text-fog-dim">
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-fog-dim">
                  {o.createdAt.toISOString().slice(0, 10)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
