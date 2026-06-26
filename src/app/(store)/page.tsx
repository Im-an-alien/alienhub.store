import Link from "next/link";
import Image from "next/image";
import { fetchCards, VISIBLE } from "@/lib/catalog";
import { Starfield } from "@/components/starfield";
import { ProductCard } from "./_components/product-card";
import { CategorySidebar } from "./_components/category-sidebar";

export default async function HomePage() {
  const [featuredRaw, bundles, newest] = await Promise.all([
    fetchCards({ ...VISIBLE, isFeatured: true }, { createdAt: "desc" }, 8),
    fetchCards({ ...VISIBLE, isBundle: true }, { createdAt: "desc" }, 4),
    fetchCards(VISIBLE, { createdAt: "desc" }, 12),
  ]);
  const featured = featuredRaw.length > 0 ? featuredRaw : newest.slice(0, 8);

  return (
    <main>
      {/* Hero with warp starfield */}
      <section className="relative -mt-16 overflow-hidden border-b border-edge">
        <Starfield />
        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-28 text-center sm:pb-24 sm:pt-32">
          <Image
            src="/logo.png"
            alt="Alien Hub"
            width={700}
            height={116}
            priority
            className="mx-auto h-auto w-56 drop-shadow-[0_2px_24px_rgba(140,255,158,0.25)] sm:w-72"
          />
          <p className="mt-6 font-mono text-xs uppercase tracking-[0.3em] text-[#8cff9e]">
            Gaming gear · delivered across Iraq
          </p>
          <h1 className="mx-auto mt-4 max-w-2xl font-display text-4xl font-black leading-tight text-[#ffffff] drop-shadow-[0_2px_20px_rgba(0,0,0,0.6)] sm:text-6xl">
            Signal Received.{" "}
            <span className="text-[#8cff9e]">Tech Acquired.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-[#ffffff]/75 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            Keyboards, mice, headsets and more — handpicked gear, delivered to
            your door.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/shop"
              className="rounded-lg bg-[#8cff9e] px-6 py-3 font-display text-xs font-bold uppercase tracking-widest text-black transition hover:bg-[#46d67a]"
            >
              Shop all gear
            </Link>
            <Link
              href="/contact"
              className="rounded-lg border border-white/25 bg-black/30 px-6 py-3 font-display text-xs font-bold uppercase tracking-widest text-fog backdrop-blur transition hover:border-[#8cff9e] hover:text-[#8cff9e]"
            >
              Contact us
            </Link>
          </div>
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
