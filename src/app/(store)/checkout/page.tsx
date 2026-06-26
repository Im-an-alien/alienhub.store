"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, cartTotal } from "@/lib/cart-store";
import { formatIQD } from "@/lib/utils";
import { placeOrder } from "./actions";

const DELIVERY_FEE = 5000;

const inputCls =
  "w-full rounded-lg border border-edge bg-space px-3 py-2 text-sm text-fog outline-none focus:border-alien-dim";
const labelCls =
  "mb-1 block font-mono text-[11px] uppercase tracking-wider text-fog-dim";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clear } = useCart();
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <main className="mx-auto max-w-4xl px-4 py-16" />;

  const subtotal = cartTotal(items);

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-fog">Your cart is empty</h1>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-lg bg-alien px-6 py-3 font-display text-xs font-bold uppercase tracking-widest text-black transition hover:bg-alien-dim"
        >
          Browse the shop
        </Link>
      </main>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await placeOrder({
      customerName: String(fd.get("customerName") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      address: String(fd.get("address") ?? ""),
      city: String(fd.get("city") ?? ""),
      notes: String(fd.get("notes") ?? ""),
      items: items.map((i) => ({ variantId: i.variantId, qty: i.qty })),
    });
    if (res.ok) {
      clear();
      router.push(`/order/${res.orderNumber}`);
    } else {
      setError(res.error);
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-fog">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="rounded-xl border border-edge bg-card p-5">
            <h2 className="mb-4 font-display text-sm font-bold text-fog">Delivery details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelCls}>Full name *</label>
                <input name="customerName" required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Phone *</label>
                <input name="phone" required inputMode="tel" placeholder="07XX XXX XXXX" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>City *</label>
                <input name="city" required placeholder="Baghdad" className={inputCls} />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Address *</label>
                <input name="address" required placeholder="Area, street, nearest landmark" className={inputCls} />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Order notes (optional)</label>
                <textarea name="notes" rows={3} className={inputCls} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-edge bg-card p-4">
            <p className="text-xs text-fog-dim">
              We&apos;ll call you to confirm your order before delivery.
            </p>
          </div>

          {error && (
            <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-alien py-3.5 font-display text-sm font-bold uppercase tracking-widest text-black transition hover:bg-alien-dim disabled:opacity-60"
          >
            {submitting ? "Placing order…" : "Place order"}
          </button>
        </form>

        <aside className="h-fit rounded-xl border border-edge bg-card p-5">
          <h2 className="font-display text-sm font-bold text-fog">Your order</h2>
          <div className="mt-4 space-y-3">
            {items.map((it) => (
              <div key={it.variantId} className="flex gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-surface">
                  {it.image ? (
                    <Image src={it.image} alt="" fill sizes="48px" className="object-cover" />
                  ) : (
                    <span className="flex h-full items-center justify-center text-fog-dim">▦</span>
                  )}
                </div>
                <div className="flex-1 text-sm">
                  <p className="text-fog">{it.name}</p>
                  <p className="text-xs text-fog-dim">
                    {it.variantName ? `${it.variantName} · ` : ""}×{it.qty}
                  </p>
                </div>
                <p className="text-sm text-fog">{formatIQD(it.price * it.qty)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 border-t border-edge pt-4 text-sm">
            <div className="flex justify-between text-fog-dim">
              <span>Subtotal</span>
              <span className="text-fog">{formatIQD(subtotal)}</span>
            </div>
            <div className="flex justify-between text-fog-dim">
              <span>Delivery</span>
              <span className="text-fog">{formatIQD(DELIVERY_FEE)}</span>
            </div>
            <div className="flex justify-between border-t border-edge pt-2 font-display text-base font-bold text-fog">
              <span>Total</span>
              <span className="text-alien">{formatIQD(subtotal + DELIVERY_FEE)}</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
