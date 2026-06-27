import Link from "next/link";
import { fetchCards, VISIBLE } from "@/lib/catalog";
import { Starfield } from "@/components/starfield";
import { ProductCard } from "./_components/product-card";
import { CategorySidebar } from "./_components/category-sidebar";
import { HeroLogo } from "./_components/hero-logo";

// Render at request time (reads live products/stock from the DB).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featuredRaw, bundles, newest] = await Promise.all([
    fetchCards({ ...VISIBLE, isFeatured: true }, { createdAt: "desc" }, 8),
    fetchCards({ ...VISIBLE, isBundle: true }, { createdAt: "desc" }, 4),
    fetchCards(VISIBLE, { createdAt: "desc" }, 12),
  ]);
  const featured = featuredRaw.length > 0 ? featuredRaw : newest.slice(0, 8);

  return (
    <main>
      {/* Hero — logo over the warp starfield */}
      <section className="relative -mt-16 flex min-h-[82vh] items-center justify-center overflow-hidden border-b border-edge bg-space">
        <Starfield />
        <div className="relative z-10 px-4">
          <HeroLogo />
        </div>
      </section>

      {/* Body: categories on the side + product rows */}
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-8 lg:flex-row">
          <CategorySidebar />

          <div className="flex-1 space-y-12">
            <ProductRow title="Featured" products={featured} />
            <ProductRow title="Bundles & combos" products={bundles} href="/bundles" />
            <ProductRow title="New arrivals" products={newest} href="/shop" />
          </div>
        </div>
      </div>
    </main>
  );
}

function ProductRow({
  title,
  products,
  href,
}: {
  title: string;
  products: Awaited<ReturnType<typeof fetchCards>>;
  href?: string;
}) {
  if (products.length === 0) return null;
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-fog">{title}</h2>
        {href && (
          <Link href={href} className="text-sm text-alien hover:underline">
            View all ›
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.slug} p={p} />
        ))}
      </div>
    </section>
  );
}
