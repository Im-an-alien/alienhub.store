/**
 * One-time data migration: old Express/SQLite back-office  ->  Postgres (Prisma).
 *
 * Imports: products (+ a default variant carrying stock), inventory, sales
 * (as DELIVERED orders), pending_orders (as open orders), expenses.
 * Also creates the unit-ID class categories and a default admin user.
 *
 * Run:  npm run migrate:legacy
 * Safe to re-run — it clears the target tables first.
 */
import path from "node:path";
import fs from "node:fs";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SQLITE_PATH = path.join(process.cwd(), "..", "alien_hub_system", "alienhub.db");

// Same class map as the old db.js
const CLASS_MAP: Record<string, { name: string; code: string }> = {
  Keyboard: { name: "Keyboards", code: "ID" },
  Mouse: { name: "Mice", code: "TD" },
  Headset: { name: "Headsets", code: "AL" },
  MousePad: { name: "Mousepads", code: "CS" },
  "Mouse Pad": { name: "Mousepads", code: "CS" },
  Controller: { name: "Controllers", code: "CI" },
  Monitor: { name: "Monitors", code: "VT" },
  Grips: { name: "Grips", code: "EM" },
  Stand: { name: "Stands", code: "SU" },
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const ADMIN_EMAIL = "admin@alienhub.store";
const ADMIN_PASSWORD = "alienhub"; // change after first login

type LegacyProduct = {
  sku: string; name: string; brand: string | null; type: string | null;
  supplier: string | null; cost: number; sell_price: number; unit_id: string | null;
};
type LegacyInv = {
  sku: string; units_in_stock: number; total_purchased: number; total_sold: number; date_stocked: string | null;
};
type LegacySale = {
  order_id: string; date: string; sku: string; units_sold: number;
  sell_price: number; cogs: number; delivery_cost: number; channel: string;
  payment: string; notes: string | null; customer_ref: string | null;
};
type LegacyPending = {
  order_id: string; date: string; sku: string; customer_ref: string | null;
  units: number; agreed_price: number; deposit: number; expected_delivery: string | null;
  status: string; notes: string | null;
};
type LegacyExpense = {
  date: string; category: string; description: string; amount: number; notes: string;
};

async function main() {
  if (!fs.existsSync(SQLITE_PATH)) {
    throw new Error(`Old SQLite DB not found at: ${SQLITE_PATH}`);
  }
  const sqlite = new Database(SQLITE_PATH);

  const products = sqlite.prepare("SELECT * FROM products").all() as LegacyProduct[];
  const inventory = sqlite.prepare("SELECT * FROM inventory").all() as LegacyInv[];
  const sales = sqlite.prepare("SELECT * FROM sales").all() as LegacySale[];
  const pending = sqlite.prepare("SELECT * FROM pending_orders").all() as LegacyPending[];
  let expenses: LegacyExpense[] = [];
  try { expenses = sqlite.prepare("SELECT * FROM expenses").all() as LegacyExpense[]; } catch { /* table may be empty */ }

  console.log(`[read] products=${products.length} inventory=${inventory.length} sales=${sales.length} pending=${pending.length} expenses=${expenses.length}`);

  // ── Clear target (child -> parent order) ──────────────────────────────────
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.productSpec.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.admin.deleteMany();

  // ── Categories (only those actually used) ─────────────────────────────────
  const usedTypes = [...new Set(products.map((p) => p.type).filter(Boolean) as string[])];
  const catByCode = new Map<string, string>(); // code -> category.id
  let catOrder = 0;
  for (const type of usedTypes) {
    const klass = CLASS_MAP[type] ?? { name: type, code: "XX" };
    if (catByCode.has(klass.code)) continue;
    const cat = await prisma.category.create({
      data: {
        name: klass.name,
        slug: slugify(klass.name),
        code: klass.code,
        typeLabel: type,
        sortOrder: catOrder++,
      },
    });
    catByCode.set(klass.code, cat.id);
  }
  console.log(`[categories] created ${catByCode.size}`);

  // ── Products (+ default variant carrying stock) ───────────────────────────
  const invBySku = new Map(inventory.map((i) => [i.sku, i]));
  const productIdBySku = new Map<string, string>();
  const variantIdBySku = new Map<string, string>();
  const usedSlugs = new Set<string>();

  for (const p of products) {
    const klass = p.type ? (CLASS_MAP[p.type] ?? { code: "XX" }) : { code: "XX" };
    const categoryId = catByCode.get(klass.code) ?? null;

    let slug = slugify(p.name) || slugify(p.sku);
    if (usedSlugs.has(slug)) slug = `${slug}-${slugify(p.sku)}`;
    while (usedSlugs.has(slug)) slug = `${slug}-x`;
    usedSlugs.add(slug);

    const inv = invBySku.get(p.sku);
    const created = await prisma.product.create({
      data: {
        sku: p.sku,
        name: p.name,
        slug,
        brand: p.brand,
        supplier: p.supplier,
        basePrice: p.sell_price,
        cost: p.cost,
        unitId: p.unit_id,
        webStatus: "AVAILABLE",
        categoryId,
        variants: {
          create: {
            name: "Default",
            isDefault: true,
            stockQty: inv?.units_in_stock ?? 0,
            totalPurchased: inv?.total_purchased ?? 0,
            totalSold: inv?.total_sold ?? 0,
          },
        },
      },
      include: { variants: true },
    });
    productIdBySku.set(p.sku, created.id);
    variantIdBySku.set(p.sku, created.variants[0].id);
  }
  console.log(`[products] created ${productIdBySku.size} (each with a default variant)`);

  // ── Sales -> DELIVERED orders (grouped by order_id) ───────────────────────
  const usedOrderNumbers = new Set<string>();
  const salesByOrder = new Map<string, LegacySale[]>();
  for (const s of sales) {
    if (!salesByOrder.has(s.order_id)) salesByOrder.set(s.order_id, []);
    salesByOrder.get(s.order_id)!.push(s);
  }

  let deliveredCount = 0;
  for (const [orderId, rows] of salesByOrder) {
    const first = rows[0];
    let subtotal = 0;
    let deliveryFee = 0;
    const items = rows
      .filter((r) => productIdBySku.has(r.sku))
      .map((r) => {
        subtotal += r.units_sold * r.sell_price;
        deliveryFee += r.delivery_cost || 0;
        const prod = products.find((p) => p.sku === r.sku)!;
        return {
          productId: productIdBySku.get(r.sku)!,
          variantId: variantIdBySku.get(r.sku)!,
          productName: prod.name,
          variantName: null,
          qty: r.units_sold,
          unitPrice: r.sell_price,
          cogsSnapshot: r.cogs,
        };
      });
    if (items.length === 0) continue;

    usedOrderNumbers.add(orderId);
    await prisma.order.create({
      data: {
        orderNumber: orderId,
        customerName: first.customer_ref?.trim() || "Walk-in / DM",
        phone: "",
        address: "",
        city: "",
        notes: first.notes || null,
        status: "DELIVERED",
        subtotal,
        deliveryFee,
        total: subtotal + deliveryFee,
        channel: first.channel || "Instagram DM",
        payment: first.payment || "Cash",
        createdAt: new Date(first.date),
        items: { create: items },
      },
    });
    deliveredCount++;
  }
  console.log(`[orders] delivered (from sales): ${deliveredCount}`);

  // ── Pending orders -> open orders ─────────────────────────────────────────
  const STATUS_MAP: Record<string, "PENDING" | "DELIVERED" | "CANCELLED" | "PROCESSING"> = {
    Pending: "PENDING",
    Complete: "DELIVERED",
    Completed: "DELIVERED",
    Cancelled: "CANCELLED",
    Processing: "PROCESSING",
  };
  let pendingCount = 0;
  for (const po of pending) {
    if (!productIdBySku.has(po.sku)) continue;
    let orderNumber = po.order_id;
    while (usedOrderNumbers.has(orderNumber)) orderNumber = `${orderNumber}-P`;
    usedOrderNumbers.add(orderNumber);

    const prod = products.find((p) => p.sku === po.sku)!;
    const unitPrice = po.agreed_price || prod.sell_price;
    const subtotal = unitPrice * (po.units || 1);
    await prisma.order.create({
      data: {
        orderNumber,
        customerName: po.customer_ref?.trim() || "Pending customer",
        phone: "",
        address: "",
        city: "",
        notes: po.notes || null,
        status: STATUS_MAP[po.status] ?? "PENDING",
        subtotal,
        deliveryFee: 0,
        total: subtotal,
        channel: "Instagram DM",
        payment: "Cash (COD)",
        createdAt: new Date(po.date),
        items: {
          create: [{
            productId: productIdBySku.get(po.sku)!,
            variantId: variantIdBySku.get(po.sku)!,
            productName: prod.name,
            qty: po.units || 1,
            unitPrice,
            cogsSnapshot: prod.cost * (po.units || 1),
          }],
        },
      },
    });
    pendingCount++;
  }
  console.log(`[orders] pending/other (from pending_orders): ${pendingCount}`);

  // ── Expenses ──────────────────────────────────────────────────────────────
  for (const e of expenses) {
    await prisma.expense.create({
      data: {
        date: new Date(e.date),
        category: e.category,
        description: e.description || "",
        amount: e.amount,
        notes: e.notes || "",
      },
    });
  }
  console.log(`[expenses] created ${expenses.length}`);

  // ── Admin user ────────────────────────────────────────────────────────────
  await prisma.admin.create({
    data: {
      email: ADMIN_EMAIL,
      passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 10),
      name: "AlienHub Admin",
    },
  });
  console.log(`[admin] created  ->  ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}  (change after first login)`);

  sqlite.close();
  console.log("\n✅ Migration complete.");
}

main()
  .catch((e) => {
    console.error("❌ Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
