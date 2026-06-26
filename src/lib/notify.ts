import "server-only";
import { formatIQD } from "@/lib/utils";

type OrderNotify = {
  orderNumber: string;
  customerName: string;
  phone: string;
  city: string;
  address: string;
  total: number;
  items: { productName: string; variantName: string | null; qty: number }[];
};

/**
 * Sends a Telegram message when a new order is placed.
 * No-op if TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID aren't configured.
 * Always fails silently — a notification problem must never block an order.
 */
export async function notifyNewOrder(o: OrderNotify): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const lines = o.items
    .map((i) => `• ${i.productName}${i.variantName ? ` (${i.variantName})` : ""} ×${i.qty}`)
    .join("\n");

  const text =
    `🛸 New order ${o.orderNumber}\n\n` +
    `👤 ${o.customerName}\n` +
    `📞 ${o.phone}\n` +
    `📍 ${o.address}, ${o.city}\n\n` +
    `${lines}\n\n` +
    `💰 Total: ${formatIQD(o.total)}`;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });
  } catch {
    // ignore — best-effort notification
  }
}
