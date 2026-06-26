import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { fetchCards, VISIBLE } from "@/lib/catalog";
import { ProductCard } from "../../_components/product-card";
import { Gallery } from "./_gallery";
import { AddToCart } from "./_add-to-cart";

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
      variants: { orderBy: [{ isDefault: "desc" }, { name: "asc" }] },
      specs: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Not found — AlienHub.Store" };
  return {
    title: `${product.name} — AlienHub.Store`,
    description: product.description ?? `${product.name} — gaming gear, cash on delivery.`,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product || product.webStatus === "HIDDEN") notFound();

  const related = await fetchCards(
    { ...VISIBLE, categoryId: product.categoryId, slug: { not: product.slug } },
    { createdAt: "desc" },
    4,
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-4 text-sm text-fog-dim">
        <Link href="/shop" className="hover:text-alien">Shop</Link>
        {product.category && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/category/${product.category.slug}`} className="hover:text-alien">
              {product.category.name}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-fog">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <Gallery images={product.images} name={product.name} />

        <div>
          {product.category && (
            <p className="font-mono text-[11px] uppercase tracking-wider text-fog-dim">
              {product.category.name}
            </p>
          )}
          <h1 className="mt-1 font-display text-3xl font-black text-fog">
            {product.name}
          </h1>
          {product.brand && (
            <p className="mt-1 text-sm text-fog-dim">{product.brand}</p>
          )}

          <div className="mt-6">
            <AddToCart
              productId={product.id}
              slug={product.slug}
              name={product.name}
              basePrice={product.basePrice}
              image={product.images[0]?.url ?? null}
              variants={product.variants.map((v) => ({
                id: v.id,
                name: v.name,
                priceOverride: v.priceOverride,
                stockQty: v.stockQty,
                isDefault: v.isDefault,
              }))}
            />
          </div>

          {product.description && (
            <div className="mt-8">
              <h2 className="mb-2 font-display text-sm font-bold text-fog">Description</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-fog">
                {product.description}
              </p>
            </div>
          )}

          {product.specs.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-2 font-display text-sm font-bold text-fog">Specifications</h2>
              <table className="w-full overflow-hidden rounded-lg border border-edge text-sm">
                <tbody className="divide-y divide-edge">
                  {product.specs.map((s) => (
                    <tr key={s.id} className="bg-card">
                      <td className="w-2/5 px-4 py-2.5 font-mono text-xs text-fog-dim">
                        {s.specKey}
                      </td>
                      <td className="px-4 py-2.5 text-fog">{s.specValue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-5 font-display text-lg font-bold text-fog">
            You might also like
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.slug} p={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
