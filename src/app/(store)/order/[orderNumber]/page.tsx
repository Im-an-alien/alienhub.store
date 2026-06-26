import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatIQD } from "@/lib/utils";

export const metadata = { title: "Order confirmed — AlienHub.Store" };

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });
  if (!order) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="rounded-2xl border border-alien/30 bg-alien/5 p-6 text-center">
        <CheckCircle2 className="mx-auto text-alien" size={44} />
        <h1 className="mt-3 font-display text-2xl font-bold text-fog">
          Order placed!
        </h1>
        <p className="mt-1 text-sm text-fog-dim">
          We&apos;ll call you shortly on{" "}
          <span className="text-fog">{order.phone}</span> to confirm.
        </p>
        <p className="mt-4 inline-block rounded-lg border border-edge bg-space px-4 py-2 font-mono text-sm text-alien">
          {order.orderNumber}
        </p>
        <p className="mt-2 text-xs text-fog-dim">
          Save this number — it&apos;s your order reference.
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-edge bg-card p-5">
        <h2 className="mb-4 font-display text-sm font-bold text-fog">Order summary</h2>
        <div className="space-y-2">
          {order.items.map((it) => (
            <div key={it.id} className="flex justify-between text-sm">
              <span className="text-fog">
                {it.productName}
                {it.variantName ? ` (${it.variantName})` : ""}{" "}
                <span className="text-fog-dim">×{it.qty}</span>
              </span>
              <span className="text-fog">{formatIQD(it.unitPrice * it.qty)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2 border-t border-edge pt-4 text-sm">
          <div className="flex justify-between text-fog-dim">
            <span>Subtotal</span>
            <span className="text-fog">{formatIQD(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-fog-dim">
            <span>Delivery</span>
            <span className="text-fog">{formatIQD(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between border-t border-edge pt-2 font-display text-base font-bold text-fog">
            <span>Total</span>
            <span className="text-alien">{formatIQD(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-edge bg-card p-5 text-sm">
        <h2 className="mb-2 font-display text-sm font-bold text-fog">Delivering to</h2>
        <p className="text-fog">{order.customerName}</p>
        <p className="text-fog-dim">{order.address}, {order.city}</p>
        {order.notes && <p className="mt-1 text-fog-dim">Note: {order.notes}</p>}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/shop"
          className="inline-block rounded-lg bg-alien px-6 py-3 font-display text-xs font-bold uppercase tracking-widest text-black transition hover:bg-alien-dim"
        >
          Continue shopping
        </Link>
      </div>
    </main>
  );
}
