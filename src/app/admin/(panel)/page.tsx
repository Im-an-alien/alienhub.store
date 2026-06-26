import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatIQD } from "@/lib/utils";

const OPEN_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "OUT_FOR_DELIVERY",
];

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "alien" | "amber" | "danger";
}) {
  const color =
    accent === "amber"
      ? "text-amber"
      : accent === "danger"
        ? "text-danger"
        : accent === "alien"
          ? "text-alien"
          : "text-fog";
  return (
    <div className="rounded-xl border border-edge bg-card p-4">
      <p className="font-mono text-[11px] uppercase tracking-wider text-fog-dim">
        {label}
      </p>
      <p className={`mt-2 font-display text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default async function AdminDashboard() {
  const [
    productCount,
    stockAgg,
    pendingCount,
    delivered,
    unreadInquiries,
    lowStock,
    recentOrders,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.productVariant.aggregate({ _sum: { stockQty: true } }),
    prisma.order.count({ where: { status: { in: OPEN_STATUSES } } }),
    prisma.order.aggregate({ where: { status: "DELIVERED" }, _sum: { total: true } }),
    prisma.inquiry.count({ where: { isRead: false } }),
    prisma.productVariant.count({ where: { stockQty: { lte: 1 } } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { items: true },
    }),
  ]);

  return (
    <div className="p-8">
      <header className="mb-6">
        <h1 className="font-display text-xl font-bold text-fog">Dashboard</h1>
        <p className="mt-1 text-sm text-fog-dim">
          Signal Received. Tech Acquired.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        <Stat label="Products" value={String(productCount)} accent="alien" />
        <Stat label="Units in stock" value={String(stockAgg._sum.stockQty ?? 0)} />
        <Stat label="Open orders" value={String(pendingCount)} accent="amber" />
        <Stat
          label="Delivered revenue"
          value={formatIQD(delivered._sum.total ?? 0)}
        />
        <Stat
          label="Unread inquiries"
          value={String(unreadInquiries)}
          accent={unreadInquiries > 0 ? "danger" : undefined}
        />
      </div>

      <div className="mt-4 rounded-xl border border-edge bg-card p-4">
        <p className="font-mono text-[11px] uppercase tracking-wider text-fog-dim">
          Low / out of stock
        </p>
        <p className="mt-1 text-sm text-fog">
          <span className="font-display text-lg text-amber">{lowStock}</span>{" "}
          variant(s) at 1 or 0 units —{" "}
          <Link href="/admin/products" className="text-alien hover:underline">
            review products
          </Link>
        </p>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 font-display text-sm font-bold text-fog">
          Recent orders
        </h2>
        <div className="overflow-hidden rounded-xl border border-edge">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left font-mono text-[11px] uppercase tracking-wider text-fog-dim">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-edge">
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-fog-dim">
                    No orders yet.
                  </td>
                </tr>
              )}
              {recentOrders.map((o) => (
                <tr key={o.id} className="bg-card">
                  <td className="px-4 py-3 font-mono text-xs text-fog">
                    {o.orderNumber}
                  </td>
                  <td className="px-4 py-3 text-fog">{o.customerName}</td>
                  <td className="px-4 py-3 text-fog-dim">{o.items.length}</td>
                  <td className="px-4 py-3 text-fog">{formatIQD(o.total)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-surface px-2 py-1 font-mono text-[10px] uppercase text-fog-dim">
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
