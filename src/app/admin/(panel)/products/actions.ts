"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import type { WebStatus } from "@prisma/client";

async function requireAdmin() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

function num(v: FormDataEntryValue | null, fallback = 0): number {
  const n = Number(String(v ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? Math.round(n) : fallback;
}

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  let slug = base || "item";
  let i = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing || existing.id === ignoreId) return slug;
    slug = `${base}-${++i}`;
  }
}

// ── Product ───────────────────────────────────────────────────────────────

export async function createProduct(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim();
  if (!name || !sku) throw new Error("Name and SKU are required.");

  const existing = await prisma.product.findUnique({ where: { sku } });
  if (existing) throw new Error("A product with that SKU already exists.");

  const slug = await uniqueSlug(slugify(name) || slugify(sku));
  const categoryId = String(formData.get("categoryId") ?? "") || null;

  const product = await prisma.product.create({
    data: {
      name,
      sku,
      slug,
      brand: String(formData.get("brand") ?? "").trim() || null,
      supplier: String(formData.get("supplier") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim() || null,
      basePrice: num(formData.get("basePrice")),
      cost: num(formData.get("cost")),
      categoryId,
      webStatus: (String(formData.get("webStatus") ?? "AVAILABLE") as WebStatus),
      isFeatured: formData.get("isFeatured") === "on",
      isBundle: formData.get("isBundle") === "on",
      variants: {
        create: { name: "Default", isDefault: true, stockQty: num(formData.get("stockQty")) },
      },
    },
  });

  revalidatePath("/admin/products");
  redirect(`/admin/products/${product.id}`);
}

export async function updateProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing product id.");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name is required.");

  await prisma.product.update({
    where: { id },
    data: {
      name,
      brand: String(formData.get("brand") ?? "").trim() || null,
      supplier: String(formData.get("supplier") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim() || null,
      basePrice: num(formData.get("basePrice")),
      cost: num(formData.get("cost")),
      categoryId: String(formData.get("categoryId") ?? "") || null,
      webStatus: String(formData.get("webStatus") ?? "AVAILABLE") as WebStatus,
      isFeatured: formData.get("isFeatured") === "on",
      isBundle: formData.get("isBundle") === "on",
    },
  });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing product id.");
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

// ── Variants ──────────────────────────────────────────────────────────────

export async function addVariant(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId") ?? "");
  const name = String(formData.get("name") ?? "").trim() || "Variant";
  if (!productId) throw new Error("Missing product id.");

  await prisma.productVariant.create({
    data: {
      productId,
      name,
      skuSuffix: String(formData.get("skuSuffix") ?? "").trim() || null,
      priceOverride: formData.get("priceOverride") ? num(formData.get("priceOverride")) : null,
      stockQty: num(formData.get("stockQty")),
    },
  });
  revalidatePath(`/admin/products/${productId}`);
}

export async function updateVariant(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const productId = String(formData.get("productId") ?? "");
  if (!id) throw new Error("Missing variant id.");

  await prisma.productVariant.update({
    where: { id },
    data: {
      name: String(formData.get("name") ?? "").trim() || "Variant",
      priceOverride: formData.get("priceOverride") ? num(formData.get("priceOverride")) : null,
      stockQty: num(formData.get("stockQty")),
    },
  });
  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteVariant(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const productId = String(formData.get("productId") ?? "");
  if (!id) throw new Error("Missing variant id.");
  await prisma.productVariant.delete({ where: { id } });
  revalidatePath(`/admin/products/${productId}`);
}

// ── Specs ─────────────────────────────────────────────────────────────────

export async function addSpec(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId") ?? "");
  const specKey = String(formData.get("specKey") ?? "").trim();
  const specValue = String(formData.get("specValue") ?? "").trim();
  if (!productId || !specKey || !specValue) throw new Error("Spec key and value required.");

  const count = await prisma.productSpec.count({ where: { productId } });
  await prisma.productSpec.create({
    data: { productId, specKey, specValue, sortOrder: count },
  });
  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteSpec(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const productId = String(formData.get("productId") ?? "");
  if (!id) throw new Error("Missing spec id.");
  await prisma.productSpec.delete({ where: { id } });
  revalidatePath(`/admin/products/${productId}`);
}

// ── Images ────────────────────────────────────────────────────────────────

export async function deleteImage(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const productId = String(formData.get("productId") ?? "");
  if (!id) throw new Error("Missing image id.");
  await prisma.productImage.delete({ where: { id } });
  revalidatePath(`/admin/products/${productId}`);
}

export async function setPrimaryImage(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const productId = String(formData.get("productId") ?? "");
  if (!id || !productId) throw new Error("Missing ids.");
  await prisma.$transaction([
    prisma.productImage.updateMany({ where: { productId }, data: { isPrimary: false } }),
    prisma.productImage.update({ where: { id }, data: { isPrimary: true } }),
  ]);
  revalidatePath(`/admin/products/${productId}`);
}
