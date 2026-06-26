"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";

async function requireAdmin() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
}

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!name || !code) throw new Error("Name and code are required.");

  const count = await prisma.category.count();
  await prisma.category.create({
    data: {
      name,
      code,
      slug: slugify(name),
      typeLabel: String(formData.get("typeLabel") ?? "").trim() || null,
      sortOrder: count,
    },
  });
  revalidatePath("/admin/categories");
}

export async function updateCategory(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) throw new Error("Missing fields.");

  await prisma.category.update({
    where: { id },
    data: {
      name,
      slug: slugify(name),
      typeLabel: String(formData.get("typeLabel") ?? "").trim() || null,
      sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
    },
  });
  revalidatePath("/admin/categories");
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id.");

  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    throw new Error(
      `Cannot delete: ${productCount} product(s) still use this category.`,
    );
  }
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
}
