"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useCart, cartTotal } from "@/lib/cart-store";
import { formatIQD } from "@/lib/utils";

const DELIVERY_FEE = 5000; // flat, all Iraq — authoritative fee applied at checkout

export default function CartPage() {
  const { items, setQty, remove } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <main className="mx-auto max-w-3xl px-4 py-16" />;
  }

  const subtotal = cartTotal(items);

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-fog">Your cart is empty</h1>
        <p className="mt-2 text-sm text-fog-dim">Add some gear to get started.</p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-lg bg-alien px-6 py-3 font-display text-xs font-bold uppercase tracking-widest text-black transition hover:bg-alien-dim"
        >
          Browse the shop
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-fog">Your cart</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {items.map((it) => (
            <div
              key={it.variantId}
              className="flex gap-3 rounded-xl border border-edge bg-card p-3"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface">
                {it.image ? (
                  <Image src={it.image} alt={it.name} fill sizes="80px" className="object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center text-fog-dim">▦</span>
                )}
              </div>
              <div className="flex flex-1 flex-col">
                <Link href={`/product/${it.slug}`} className="font-display text-sm font-bold text-fog hover:text-alien">
                  {it.name}
                </Link>
                {it.variantName && (
                  <p className="text-xs text-fog-dim">{it.variantName}</p>
                )}
                <p className="mt-1 text-sm text-alien">{formatIQD(it.price)}</p>
                <div className="mt-auto flex items-center gap-3">
                  <div className="flex items-center rounded-lg border border-edge">
                    <button type="button" onClick={() => setQty(it.variantId, it.qty - 1)} className="px-3 py-1.5 text-fog-dim hover:text-alien">−</button>
                    <span className="w-8 text-center text-sm text-fog">{it.qty}</span>
                    <button type="button" onClick={() => setQty(it.variantId, it.qty + 1)} className="px-3 py-1.5 text-fog-dim hover:text-alien">+</button>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(it.variantId)}
                    className="flex items-center gap-1 text-xs text-fog-dim hover:text-danger"
                  >
                    <Trash2 size={13} /> Remove
                  </button>
                </div>
              </div>
              <div className="font-display text-sm font-bold text-fog">
                {formatIQD(it.price * it.qty)}
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-xl border border-edge bg-card p-5">
          <h2 className="font-display text-sm font-bold text-fog">Order summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-fog-dim">
              <span>Subtotal</span>
              <span className="text-fog">{formatIQD(subtotal)}</span>
            </div>
            <div className="flex justify-between text-fog-dim">
              <span>Delivery (all Iraq)</span>
              <span className="text-fog">{formatIQD(DELIVERY_FEE)}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-edge pt-3 font-display text-base font-bold text-fog">
              <span>Total</span>
              <span className="text-alien">{formatIQD(subtotal + DELIVERY_FEE)}</span>
            </div>
          </div>
          <Link
            href="/checkout"
            className="mt-5 block rounded-lg bg-alien py-3 text-center font-display text-xs font-bold uppercase tracking-widest text-black transition hover:bg-alien-dim"
          >
            Proceed to checkout
          </Link>
        </aside>
      </div>
    </main>
  );
}
