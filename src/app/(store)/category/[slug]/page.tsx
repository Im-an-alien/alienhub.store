import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { fetchCards, VISIBLE } from "@/lib/catalog";
import { ProductCard } from "../../_components/product-card";
import { CategorySidebar } from "../../_components/category-sidebar";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const products = await fetchCards(
    { ...VISIBLE, categoryId: category.id },
    { createdAt: "desc" },
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-4 text-sm text-fog-dim">
        <Link href="/shop" className="hover:text-alien">Shop</Link>
        <span className="mx-2">/</span>
        <span className="text-fog">{category.name}</span>
      </nav>

      <div className="flex flex-col gap-8 lg:flex-row">
        <CategorySidebar activeSlug={category.slug} />

        <div className="flex-1">
          <header className="mb-6">
            <h1 className="font-display text-2xl font-bold text-fog">{category.name}</h1>
            <p className="mt-1 text-sm text-fog-dim">{products.length} products</p>
          </header>

          {products.length === 0 ? (
            <p className="rounded-xl border border-dashed border-edge2 bg-card p-10 text-center text-sm text-fog-dim">
              Nothing here yet — check back soon.
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
