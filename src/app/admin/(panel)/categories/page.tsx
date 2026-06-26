import { Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { createCategory, updateCategory, deleteCategory } from "./actions";

const inputCls =
  "w-full rounded-lg border border-edge bg-space px-3 py-2 text-sm text-fog outline-none focus:border-alien-dim";
const labelCls =
  "mb-1 block font-mono text-[11px] uppercase tracking-wider text-fog-dim";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="p-8">
      <header className="mb-6">
        <h1 className="font-display text-xl font-bold text-fog">Categories</h1>
        <p className="mt-1 text-sm text-fog-dim">
          The unit-ID classes shown on the storefront ({categories.length})
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-2 lg:col-span-2">
          {categories.map((c) => (
            <form
              key={c.id}
              action={updateCategory}
              className="flex items-end gap-2 rounded-lg border border-edge bg-card p-3"
            >
              <input type="hidden" name="id" value={c.id} />
              <div className="w-16">
                <label className={labelCls}>Code</label>
                <input value={c.code} disabled className={`${inputCls} opacity-60`} />
              </div>
              <div className="flex-1">
                <label className={labelCls}>Name</label>
                <input name="name" defaultValue={c.name} className={inputCls} />
              </div>
              <div className="w-32">
                <label className={labelCls}>Type label</label>
                <input name="typeLabel" defaultValue={c.typeLabel ?? ""} className={inputCls} />
              </div>
              <div className="w-16">
                <label className={labelCls}>Order</label>
                <input name="sortOrder" type="number" defaultValue={c.sortOrder} className={inputCls} />
              </div>
              <button className="rounded-lg bg-alien/90 px-3 py-2 font-mono text-[11px] font-bold text-black hover:bg-alien">
                Save
              </button>
              <button
                formAction={deleteCategory}
                className="rounded-lg border border-danger/40 px-2 py-2 text-danger hover:bg-danger/10"
                title={c._count.products > 0 ? `${c._count.products} products use this` : "Delete"}
              >
                <Trash2 size={14} />
              </button>
            </form>
          ))}
        </div>

        <form
          action={createCategory}
          className="h-fit space-y-4 rounded-xl border border-edge bg-card p-5"
        >
          <h2 className="font-display text-sm font-bold text-fog">New category</h2>
          <div>
            <label className={labelCls}>Name *</label>
            <input name="name" required placeholder="Targeting Device" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Code *</label>
            <input name="code" required placeholder="TD" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Type label</label>
            <input name="typeLabel" placeholder="Mouse" className={inputCls} />
          </div>
          <button className="w-full rounded-lg bg-alien py-2.5 font-display text-xs font-bold uppercase tracking-widest text-black transition hover:bg-alien-dim">
            Add category
          </button>
        </form>
      </div>
    </div>
  );
}
