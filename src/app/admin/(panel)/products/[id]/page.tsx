import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Star, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatIQD } from "@/lib/utils";
import { ImageUploader } from "./_image-uploader";
import {
  updateProduct,
  deleteProduct,
  addVariant,
  updateVariant,
  deleteVariant,
  addSpec,
  deleteSpec,
  deleteImage,
  setPrimaryImage,
} from "../actions";

const inputCls =
  "w-full rounded-lg border border-edge bg-space px-3 py-2 text-sm text-fog outline-none focus:border-alien-dim";
const labelCls =
  "mb-1 block font-mono text-[11px] uppercase tracking-wider text-fog-dim";
const sectionCls = "rounded-xl border border-edge bg-card p-5";
const h2Cls = "mb-4 font-display text-sm font-bold text-fog";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
        variants: { orderBy: [{ isDefault: "desc" }, { name: "asc" }] },
        specs: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div className="p-8">
      <Link
        href="/admin/products"
        className="mb-4 inline-flex items-center gap-1 text-sm text-fog-dim hover:text-alien"
      >
        <ArrowLeft size={15} /> Back to products
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-fog">{product.name}</h1>
          <p className="font-mono text-[11px] text-fog-dim">
            {product.sku} · {product.unitId ?? "no unit-id"}
          </p>
        </div>
        <form action={deleteProduct}>
          <input type="hidden" name="id" value={product.id} />
          <button className="flex items-center gap-2 rounded-lg border border-danger/40 px-3 py-2 text-xs text-danger transition hover:bg-danger/10">
            <Trash2 size={14} /> Delete
          </button>
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Details */}
        <form action={updateProduct} className={sectionCls}>
          <input type="hidden" name="id" value={product.id} />
          <h2 className={h2Cls}>Details</h2>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Name</label>
              <input name="name" defaultValue={product.name} required className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Brand</label>
                <input name="brand" defaultValue={product.brand ?? ""} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Supplier</label>
                <input name="supplier" defaultValue={product.supplier ?? ""} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Price (IQD)</label>
                <input name="basePrice" type="number" defaultValue={product.basePrice} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Cost (IQD)</label>
                <input name="cost" type="number" defaultValue={product.cost} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Category</label>
                <select name="categoryId" defaultValue={product.categoryId ?? ""} className={inputCls}>
                  <option value="">— None —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Website status</label>
                <select name="webStatus" defaultValue={product.webStatus} className={inputCls}>
                  <option value="AVAILABLE">Available (shown on store)</option>
                  <option value="HIDDEN">Hidden</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea name="description" rows={4} defaultValue={product.description ?? ""} className={inputCls} />
            </div>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm text-fog">
                <input name="isFeatured" type="checkbox" defaultChecked={product.isFeatured} className="accent-[var(--color-alien)]" />
                Feature on homepage
              </label>
              <label className="flex items-center gap-2 text-sm text-fog">
                <input name="isBundle" type="checkbox" defaultChecked={product.isBundle} className="accent-[var(--color-alien)]" />
                This is a bundle / combo
              </label>
            </div>
            <button className="rounded-lg bg-alien px-5 py-2.5 font-display text-xs font-bold uppercase tracking-widest text-black transition hover:bg-alien-dim">
              Save details
            </button>
          </div>
        </form>

        <div className="space-y-6">
          {/* Images */}
          <section className={sectionCls}>
            <h2 className={h2Cls}>Images</h2>
            <ImageUploader productId={product.id} />
            {product.images.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {product.images.map((img) => (
                  <div key={img.id} className="group relative overflow-hidden rounded-lg border border-edge">
                    <div className="relative aspect-square bg-surface">
                      <Image src={img.url} alt="" fill className="object-cover" sizes="120px" />
                    </div>
                    {img.isPrimary && (
                      <span className="absolute left-1 top-1 rounded bg-alien px-1.5 py-0.5 font-mono text-[9px] font-bold text-black">
                        MAIN
                      </span>
                    )}
                    <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-space/80 p-1 opacity-0 transition group-hover:opacity-100">
                      {!img.isPrimary && (
                        <form action={setPrimaryImage}>
                          <input type="hidden" name="id" value={img.id} />
                          <input type="hidden" name="productId" value={product.id} />
                          <button className="text-fog-dim hover:text-alien" title="Set as main">
                            <Star size={14} />
                          </button>
                        </form>
                      )}
                      <form action={deleteImage} className="ml-auto">
                        <input type="hidden" name="id" value={img.id} />
                        <input type="hidden" name="productId" value={product.id} />
                        <button className="text-fog-dim hover:text-danger" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Variants */}
          <section className={sectionCls}>
            <h2 className={h2Cls}>Variants & stock</h2>
            <div className="space-y-2">
              {product.variants.map((v) => (
                <form
                  key={v.id}
                  action={updateVariant}
                  className="flex items-end gap-2 rounded-lg border border-edge bg-space p-2"
                >
                  <input type="hidden" name="id" value={v.id} />
                  <input type="hidden" name="productId" value={product.id} />
                  <div className="flex-1">
                    <label className={labelCls}>Variant</label>
                    <input name="name" defaultValue={v.name} className={inputCls} />
                  </div>
                  <div className="w-28">
                    <label className={labelCls}>Price override</label>
                    <input
                      name="priceOverride"
                      type="number"
                      defaultValue={v.priceOverride ?? ""}
                      placeholder={String(product.basePrice)}
                      className={inputCls}
                    />
                  </div>
                  <div className="w-20">
                    <label className={labelCls}>Stock</label>
                    <input name="stockQty" type="number" defaultValue={v.stockQty} className={inputCls} />
                  </div>
                  <button className="rounded-lg bg-alien/90 px-3 py-2 font-mono text-[11px] font-bold text-black hover:bg-alien">
                    Save
                  </button>
                  {!v.isDefault && (
                    <button
                      formAction={deleteVariant}
                      className="rounded-lg border border-danger/40 px-2 py-2 text-danger hover:bg-danger/10"
                      title="Delete variant"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </form>
              ))}
            </div>

            <form action={addVariant} className="mt-3 flex items-end gap-2 border-t border-edge pt-3">
              <input type="hidden" name="productId" value={product.id} />
              <div className="flex-1">
                <label className={labelCls}>New variant name</label>
                <input name="name" placeholder="e.g. Pink, TKL" className={inputCls} />
              </div>
              <div className="w-20">
                <label className={labelCls}>Stock</label>
                <input name="stockQty" type="number" defaultValue={0} className={inputCls} />
              </div>
              <button className="rounded-lg border border-edge2 px-3 py-2 font-mono text-[11px] text-fog hover:border-alien-dim hover:text-alien">
                + Add
              </button>
            </form>
          </section>

          {/* Specs */}
          <section className={sectionCls}>
            <h2 className={h2Cls}>Specifications</h2>
            <div className="space-y-2">
              {product.specs.map((s) => (
                <div key={s.id} className="flex items-center gap-2 rounded-lg border border-edge bg-space px-3 py-2 text-sm">
                  <span className="w-40 font-mono text-xs text-fog-dim">{s.specKey}</span>
                  <span className="flex-1 text-fog">{s.specValue}</span>
                  <form action={deleteSpec}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="productId" value={product.id} />
                    <button className="text-fog-dim hover:text-danger">
                      <Trash2 size={13} />
                    </button>
                  </form>
                </div>
              ))}
              {product.specs.length === 0 && (
                <p className="text-xs text-fog-dim">No specs yet.</p>
              )}
            </div>

            <form action={addSpec} className="mt-3 flex items-end gap-2 border-t border-edge pt-3">
              <input type="hidden" name="productId" value={product.id} />
              <div className="w-40">
                <label className={labelCls}>Spec</label>
                <input name="specKey" placeholder="Switch type" className={inputCls} />
              </div>
              <div className="flex-1">
                <label className={labelCls}>Value</label>
                <input name="specValue" placeholder="Blue mechanical" className={inputCls} />
              </div>
              <button className="rounded-lg border border-edge2 px-3 py-2 font-mono text-[11px] text-fog hover:border-alien-dim hover:text-alien">
                + Add
              </button>
            </form>
          </section>
        </div>
      </div>

      <p className="mt-6 text-sm text-fog-dim">
        Current price shown to customers:{" "}
        <span className="text-fog">{formatIQD(product.basePrice)}</span>
      </p>
    </div>
  );
}
