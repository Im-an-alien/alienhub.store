import { fetchCards, VISIBLE } from "@/lib/catalog";
import { ProductCard } from "../_components/product-card";

export const metadata = { title: "Bundles & combos — AlienHub.Store" };
export const dynamic = "force-dynamic";

export default async function BundlesPage() {
  const bundles = await fetchCards({ ...VISIBLE, isBundle: true }, { createdAt: "desc" });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-fog">Bundles &amp; combos</h1>
        <p className="mt-1 text-sm text-fog-dim">
          Gear up for less — curated kits at a better price.
        </p>
      </header>

      {bundles.length === 0 ? (
        <p className="rounded-xl border border-dashed border-edge2 bg-card p-10 text-center text-sm text-fog-dim">
          No bundles yet — check back soon.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {bundles.map((p) => (
            <ProductCard key={p.slug} p={p} />
          ))}
        </div>
      )}
    </main>
  );
}
