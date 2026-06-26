"use client";

import { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { formatIQD } from "@/lib/utils";

type Variant = {
  id: string;
  name: string;
  priceOverride: number | null;
  stockQty: number;
  isDefault: boolean;
};

export function AddToCart({
  productId,
  slug,
  name,
  basePrice,
  image,
  variants,
}: {
  productId: string;
  slug: string;
  name: string;
  basePrice: number;
  image: string | null;
  variants: Variant[];
}) {
  const add = useCart((s) => s.add);
  const [variantId, setVariantId] = useState(
    variants.find((v) => v.stockQty > 0)?.id ?? variants[0]?.id,
  );
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = variants.find((v) => v.id === variantId) ?? variants[0];
  const price = variant?.priceOverride ?? basePrice;
  const inStock = (variant?.stockQty ?? 0) > 0;
  const hasMultiple = variants.length > 1;

  function handleAdd() {
    if (!variant || !inStock) return;
    add(
      {
        productId,
        variantId: variant.id,
        slug,
        name,
        variantName: variant.isDefault ? undefined : variant.name,
        price,
        image: image ?? undefined,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="space-y-5">
      <p className="font-display text-3xl font-bold text-alien">{formatIQD(price)}</p>

      {hasMultiple && (
        <div>
          <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-fog-dim">
            Option
          </label>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => {
              const out = v.stockQty <= 0;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVariantId(v.id)}
                  disabled={out}
                  className={`btn-press rounded-lg border px-3 py-2 text-sm transition ${
                    v.id === variantId
                      ? "border-alien bg-alien/10 text-alien"
                      : "border-edge text-fog hover:border-edge2"
                  } ${out ? "cursor-not-allowed opacity-40" : ""}`}
                >
                  {v.name}
                  {out && " · out"}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-lg border border-edge">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-4 py-3 text-fog-dim hover:text-alien"
          >
            −
          </button>
          <span className="w-10 text-center text-sm text-fog">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            className="px-4 py-3 text-fog-dim hover:text-alien"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!inStock}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-3 font-display text-xs font-bold uppercase tracking-widest transition ${
            !inStock
              ? "cursor-not-allowed bg-card text-fog-dim"
              : added
                ? "bg-alien-dim text-black"
                : "bg-alien text-black hover:bg-alien-dim"
          }`}
        >
          {!inStock ? (
            "Out of stock"
          ) : added ? (
            <>
              <Check size={16} /> Added to cart
            </>
          ) : (
            <>
              <ShoppingCart size={16} /> Add to cart
            </>
          )}
        </button>
      </div>

      <p className="font-mono text-xs text-fog-dim">
        {inStock ? `${variant?.stockQty} in stock` : "Currently unavailable"}
      </p>
    </div>
  );
}
