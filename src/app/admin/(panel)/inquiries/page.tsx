import { prisma } from "@/lib/prisma";

export default async function InquiriesPage() {
  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: { select: { name: true } } },
    take: 100,
  });

  return (
    <div className="p-8">
      <header className="mb-6">
        <h1 className="font-display text-xl font-bold text-fog">Inquiries</h1>
        <p className="mt-1 text-sm text-fog-dim">
          Customer leads — &ldquo;Notify me&rdquo; and contact messages
        </p>
      </header>

      {inquiries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-edge2 bg-card p-10 text-center text-sm text-fog-dim">
          No inquiries yet. These appear when customers request a coming-soon item
          or send a contact message from the storefront.
        </div>
      ) : (
        <div className="space-y-2">
          {inquiries.map((q) => (
            <div key={q.id} className="rounded-lg border border-edge bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-fog">
                  {q.name} · <span className="font-mono text-fog-dim">{q.phone}</span>
                </p>
                <span className="rounded-full bg-surface px-2 py-1 font-mono text-[10px] uppercase text-fog-dim">
                  {q.type}
                </span>
              </div>
              {q.product && (
                <p className="mt-1 text-xs text-alien">re: {q.product.name}</p>
              )}
              {q.message && <p className="mt-1 text-sm text-fog">{q.message}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
