import Link from "next/link";
import Image from "next/image";
import { formatIQD } from "@/lib/utils";
import type { CardProduct } from "@/lib/catalog";

function StockBadge({ p }: { p: CardProduct }) {
  if (p.stock <= 0) {
    return (
      <span className="rounded-full bg-danger/15 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-danger">
        Out of stock
      </span>
    );
  }
  if (p.stock <= 1) {
    return (
      <span className="rounded-full bg-amber/15 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-amber">
        Low stock
      </span>
    );
  }
  return (
    <span className="rounded-full bg-alien/15 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-alien">
      In stock
    </span>
  );
}

export function ProductCard({ p }: { p: CardProduct }) {
  return (
    <Link
      href={`/product/${p.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-edge bg-card transition hover:border-alien-dim hover:shadow-[0_0_20px_rgba(140,255,158,0.08)]"
    >
      <div className="relative aspect-square overflow-hidden bg-surface">
        {p.image ? (
          <Image
            src={p.image}
            alt={p.name}
            fill
            sizes="(max-width: 768px) 50vw, 240px"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl text-fog-dim">
            ▦
          </div>
        )}
        <div className="absolute left-2 top-2">
          <StockBadge p={p} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3">
        {p.categoryName && (
          <p className="font-mono text-[10px] uppercase tracking-wider text-fog-dim">
            {p.categoryName}
          </p>
        )}
        <h3 className="mt-0.5 font-display text-sm font-bold text-fog">
          {p.name}
        </h3>
        {p.brand && <p className="text-xs text-fog-dim">{p.brand}</p>}
        <div className="mt-auto pt-3">
          <span className="font-display text-base font-bold text-alien">
            {formatIQD(p.basePrice)}
          </span>
        </div>
      </div>
    </Link>
  );
}
