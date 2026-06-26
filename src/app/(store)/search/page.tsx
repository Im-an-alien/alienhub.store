import type { Prisma } from "@prisma/client";
import { fetchCards, VISIBLE } from "@/lib/catalog";
import { ProductCard } from "../_components/product-card";
import { CategorySidebar } from "../_components/category-sidebar";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const term = q.trim();

  const where: Prisma.ProductWhereInput = {
    ...VISIBLE,
    ...(term
      ? {
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { brand: { contains: term, mode: "insensitive" } },
            { category: { name: { contains: term, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const products = term ? await fetchCards(where, { createdAt: "desc" }) : [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-fog">
          {term ? `Search: “${term}”` : "Search"}
        </h1>
        <p className="mt-1 text-sm text-fog-dim">
          {term ? `${products.length} result${products.length === 1 ? "" : "s"}` : "Type in the search bar above."}
        </p>
      </header>

      <div className="flex flex-col gap-8 lg:flex-row">
        <CategorySidebar />

        <div className="flex-1">
          {term && products.length === 0 ? (
            <p className="rounded-xl border border-dashed border-edge2 bg-card p-10 text-center text-sm text-fog-dim">
              No products found for “{term}”.
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
