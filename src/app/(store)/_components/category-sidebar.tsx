import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { VISIBLE } from "@/lib/catalog";

export async function CategorySidebar({ activeSlug }: { activeSlug?: string }) {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: { where: VISIBLE } } } },
  });

  return (
    <aside className="lg:w-52 lg:shrink-0">
      <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-fog-dim">
        Categories
      </p>
      <nav className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
        <Link
          href="/shop"
          className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
            !activeSlug ? "bg-card text-alien" : "text-fog-dim hover:bg-card hover:text-fog"
          }`}
        >
          <span>All products</span>
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/category/${c.slug}`}
            className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
              activeSlug === c.slug
                ? "bg-card text-alien"
                : "text-fog-dim hover:bg-card hover:text-fog"
            }`}
          >
            <span>{c.name}</span>
            <span className="font-mono text-[11px] text-fog-dim">{c._count.products}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
