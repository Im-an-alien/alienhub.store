import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatIQD } from "@/lib/utils";

const STATUS_STYLE: Record<string, string> = {
  AVAILABLE: "text-alien bg-alien/10",
  COMING_SOON: "text-amber bg-amber/10",
  HIDDEN: "text-fog-dim bg-surface",
};

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      category: true,
      variants: true,
      images: { where: { isPrimary: true }, take: 1 },
    },
  });

  return (
    <div className="p-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-fog">Products</h1>
          <p className="mt-1 text-sm text-fog-dim">{products.length} items</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-lg bg-alien px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-black transition hover:bg-alien-dim"
        >
          <Plus size={15} /> Add product
        </Link>
      </header>

      <div className="overflow-hidden rounded-xl border border-edge">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left font-mono text-[11px] uppercase tracking-wider text-fog-dim">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-edge">
            {products.map((p) => {
              const stock = p.variants.reduce((s, v) => s + v.stockQty, 0);
              const img = p.images[0]?.url;
              return (
                <tr key={p.id} className="bg-card">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-edge bg-surface">
                        {img ? (
                          <Image src={img} alt="" fill className="object-cover" sizes="40px" />
                        ) : (
                          <span className="flex h-full items-center justify-center text-fog-dim">
                            ▦
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-fog">{p.name}</p>
                        <p className="font-mono text-[11px] text-fog-dim">{p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-fog-dim">{p.category?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-fog">{formatIQD(p.basePrice)}</td>
                  <td className="px-4 py-3">
                    <span className={stock === 0 ? "text-danger" : stock <= 1 ? "text-amber" : "text-fog"}>
                      {stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 font-mono text-[10px] uppercase ${STATUS_STYLE[p.webStatus]}`}
                    >
                      {p.webStatus.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="inline-flex items-center gap-1 text-fog-dim hover:text-alien"
                    >
                      <Pencil size={14} /> Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
