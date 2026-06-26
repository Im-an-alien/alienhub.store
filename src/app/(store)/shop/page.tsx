import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { fetchCards, VISIBLE } from "@/lib/catalog";
import { ProductCard } from "../_components/product-card";
import { CategorySidebar } from "../_components/category-sidebar";

type SearchParams = Promise<{ status?: string; sort?: string }>;

const SORTS: Record<string, Prisma.ProductOrderByWithRelationInput> = {
  newest: { createdAt: "desc" },
  "price-asc": { basePrice: "asc" },
  "price-desc": { basePrice: "desc" },
};

function buildHref(base: Record<string, string | undefined>, patch: Record<string, string | undefined>) {
  const merged = { ...base, ...patch };
  const qs = Object.entries(merged)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  return qs ? `/shop?${qs}` : "/shop";
}

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const { status, sort = "newest" } = sp;

  const where: Prisma.ProductWhereInput = { ...VISIBLE };
  if (status === "in-stock") where.variants = { some: { stockQty: { gt: 0 } } };

  const products = await fetchCards(where, SORTS[sort] ?? SORTS.newest);

  const chip = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-xs font-medium transition ${
      active ? "bg-alien text-black" : "border border-edge text-fog-dim hover:text-fog"
    }`;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-fog">Shop all gear</h1>
        <p className="mt-1 text-sm text-fog-dim">{products.length} products</p>
      </header>

      <div className="flex flex-col gap-8 lg:flex-row">
        <CategorySidebar />

        <div className="flex-1">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <Link href={buildHref(sp, { status: undefined })} className={chip(!status)}>All</Link>
            <Link href={buildHref(sp, { status: "in-stock" })} className={chip(status === "in-stock")}>In stock</Link>

            <span className="mx-2 h-4 w-px bg-edge" />

            <Link href={buildHref(sp, { sort: "newest" })} className={chip(sort === "newest")}>Newest</Link>
            <Link href={buildHref(sp, { sort: "price-asc" })} className={chip(sort === "price-asc")}>Price ↑</Link>
            <Link href={buildHref(sp, { sort: "price-desc" })} className={chip(sort === "price-desc")}>Price ↓</Link>
          </div>

          {products.length === 0 ? (
            <p className="rounded-xl border border-dashed border-edge2 bg-card p-10 text-center text-sm text-fog-dim">
              No products match these filters.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.slug} p={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
