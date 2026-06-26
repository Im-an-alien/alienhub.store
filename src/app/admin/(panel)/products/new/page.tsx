import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { createProduct } from "../actions";

const inputCls =
  "w-full rounded-lg border border-edge bg-space px-3 py-2 text-sm text-fog outline-none focus:border-alien-dim";
const labelCls =
  "mb-1 block font-mono text-[11px] uppercase tracking-wider text-fog-dim";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="p-8">
      <Link
        href="/admin/products"
        className="mb-4 inline-flex items-center gap-1 text-sm text-fog-dim hover:text-alien"
      >
        <ArrowLeft size={15} /> Back to products
      </Link>
      <h1 className="mb-6 font-display text-xl font-bold text-fog">New product</h1>

      <form action={createProduct} className="max-w-2xl space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelCls}>Name *</label>
            <input name="name" required className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>SKU *</label>
            <input name="sku" required className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Brand</label>
            <input name="brand" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Category</label>
            <select name="categoryId" className={inputCls} defaultValue="">
              <option value="">— None —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Supplier</label>
            <input name="supplier" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Price (IQD) *</label>
            <input name="basePrice" type="number" min="0" required className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Cost (IQD, admin only)</label>
            <input name="cost" type="number" min="0" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Starting stock</label>
            <input name="stockQty" type="number" min="0" defaultValue={0} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Website status</label>
            <select name="webStatus" className={inputCls} defaultValue="AVAILABLE">
              <option value="AVAILABLE">Available (shown on store)</option>
              <option value="HIDDEN">Hidden</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>Description</label>
          <textarea name="description" rows={4} className={inputCls} />
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-fog">
            <input name="isFeatured" type="checkbox" className="accent-[var(--color-alien)]" />
            Feature on homepage
          </label>
          <label className="flex items-center gap-2 text-sm text-fog">
            <input name="isBundle" type="checkbox" className="accent-[var(--color-alien)]" />
            This is a bundle / combo
          </label>
        </div>

        <p className="text-xs text-fog-dim">
          You can add images, specs, and variants after creating the product.
        </p>

        <button
          type="submit"
          className="rounded-lg bg-alien px-5 py-2.5 font-display text-xs font-bold uppercase tracking-widest text-black transition hover:bg-alien-dim"
        >
          Create product
        </button>
      </form>
    </div>
  );
}
