"use server";

import { z } from "zod";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { notifyNewOrder } from "@/lib/notify";

const schema = z.object({
  customerName: z.string().trim().min(2, "Please enter your name."),
  phone: z.string().trim().min(6, "Please enter a valid phone number."),
  address: z.string().trim().min(3, "Please enter your address."),
  city: z.string().trim().min(2, "Please enter your city."),
  notes: z.string().trim().optional(),
  items: z
    .array(z.object({ variantId: z.string(), qty: z.number().int().positive() }))
    .min(1, "Your cart is empty."),
});

export type PlaceOrderInput = z.infer<typeof schema>;
export type PlaceOrderResult =
  | { ok: true; orderNumber: string }
  | { ok: false; error: string };

async function nextOrderNumber(): Promise<string> {
  const orders = await prisma.order.findMany({
    where: { orderNumber: { startsWith: "ORD-" } },
    select: { orderNumber: true },
  });
  let max = 0;
  for (const o of orders) {
    const m = o.orderNumber.match(/^ORD-(\d+)/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `ORD-${String(max + 1).padStart(3, "0")}`;
}

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid form." };
  }
  const { customerName, phone, address, city, notes, items } = parsed.data;

  // Re-fetch authoritative prices/names from DB — never trust client-sent prices.
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: items.map((i) => i.variantId) } },
    include: { product: true },
  });
  const byId = new Map(variants.map((v) => [v.id, v]));

  let subtotal = 0;
  const orderItems: Prisma.OrderItemCreateManyOrderInput[] = [];
  for (const it of items) {
    const v = byId.get(it.variantId);
    if (!v) return { ok: false, error: "An item in your cart is no longer available." };
    if (v.product.webStatus === "HIDDEN") {
      return { ok: false, error: `${v.product.name} is currently unavailable.` };
    }
    const unitPrice = v.priceOverride ?? v.product.basePrice;
    subtotal += unitPrice * it.qty;
    orderItems.push({
      productId: v.productId,
      variantId: v.id,
      productName: v.product.name,
      variantName: v.isDefault ? null : v.name,
      qty: it.qty,
      unitPrice,
      cogsSnapshot: v.product.cost * it.qty,
    });
  }

  const deliveryFee = Number(process.env.DELIVERY_FEE ?? 5000);
  const total = subtotal + deliveryFee;

  // Create with a small retry in case two orders grab the same number.
  for (let attempt = 0; attempt < 4; attempt++) {
    const orderNumber = await nextOrderNumber();
    try {
      await prisma.order.create({
        data: {
          orderNumber,
          customerName,
          phone,
          address,
          city,
          notes: notes || null,
          status: "PENDING",
          subtotal,
          deliveryFee,
          total,
          channel: "Website",
          payment: "Cash (COD)",
          items: { createMany: { data: orderItems } },
        },
      });
      revalidatePath("/admin/orders");
      revalidatePath("/admin");
      await notifyNewOrder({
        orderNumber,
        customerName,
        phone,
        city,
        address,
        total,
        items: orderItems.map((i) => ({
          productName: i.productName,
          variantName: i.variantName ?? null,
          qty: i.qty ?? 1,
        })),
      });
      return { ok: true, orderNumber };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        continue; // duplicate order number, retry
      }
      return { ok: false, error: "Could not place the order. Please try again." };
    }
  }
  return { ok: false, error: "Could not place the order. Please try again." };
}
