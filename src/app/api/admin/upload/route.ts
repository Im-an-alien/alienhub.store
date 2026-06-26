import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const productId = String(form.get("productId") ?? "");
  const files = form.getAll("files").filter((f): f is File => f instanceof File);

  if (!productId) {
    return NextResponse.json({ error: "Missing productId" }, { status: 400 });
  }
  if (files.length === 0) {
    return NextResponse.json({ error: "No files" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });

  const existingCount = await prisma.productImage.count({ where: { productId } });
  const created = [];

  for (let i = 0; i < files.length; i++) {
    const buf = Buffer.from(await files[i].arrayBuffer());
    const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.webp`;
    const optimized = await sharp(buf)
      .rotate()
      .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    await fs.writeFile(path.join(uploadDir, filename), optimized);

    const img = await prisma.productImage.create({
      data: {
        productId,
        url: `/uploads/${filename}`,
        isPrimary: existingCount === 0 && i === 0,
        sortOrder: existingCount + i,
      },
    });
    created.push(img);
  }

  return NextResponse.json({ ok: true, images: created });
}
