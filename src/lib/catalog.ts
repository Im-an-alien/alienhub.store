import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type CardProduct = {
  slug: string;
  name: string;
  brand: string | null;
  basePrice: number;
  webStatus: "AVAILABLE" | "COMING_SOON" | "HIDDEN";
  categoryName: string | null;
  image: string | null;
  stock: number;
};

const cardInclude = {
  category: { select: { name: true } },
  variants: { select: { stockQty: true } },
  images: {
    where: { isPrimary: true },
    take: 1,
    select: { url: true },
  },
} satisfies Prisma.ProductInclude;

type RawCard = Prisma.ProductGetPayload<{ include: typeof cardInclude }>;

function toCard(p: RawCard): CardProduct {
  return {
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    basePrice: p.basePrice,
    webStatus: p.webStatus as CardProduct["webStatus"],
    categoryName: p.category?.name ?? null,
    image: p.images[0]?.url ?? null,
    stock: p.variants.reduce((s, v) => s + v.stockQty, 0),
  };
}

/** Visible = available on the storefront (not hidden). */
export const VISIBLE: Prisma.ProductWhereInput = {
  webStatus: "AVAILABLE",
};

export async function fetchCards(
  where: Prisma.ProductWhereInput,
  orderBy: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] = { createdAt: "desc" },
  take?: number,
): Promise<CardProduct[]> {
  const rows = await prisma.product.findMany({
    where,
    orderBy,
    take,
    include: cardInclude,
  });
  return rows.map(toCard);
}
