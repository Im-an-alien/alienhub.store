import Image from "next/image";
import { Truck, Clock } from "lucide-react";
import { InstagramIcon } from "@/components/icons";

export const metadata = { title: "Contact — AlienHub.Store" };

const INSTAGRAM_URL = "https://www.instagram.com/alienhub.store";

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-2xl font-bold text-fog">Get in touch</h1>
      <p className="mt-2 text-sm text-fog-dim">
        The fastest way to reach us is on Instagram — DM us anytime.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div className="space-y-3">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-edge bg-card p-4 transition hover:border-alien-dim"
          >
            <InstagramIcon className="text-alien" size={22} />
            <div>
              <p className="text-sm font-medium text-fog">@alienhub.store</p>
              <p className="text-xs text-fog-dim">Tap to open Instagram &amp; DM us</p>
            </div>
          </a>
          <div className="flex items-center gap-3 rounded-xl border border-edge bg-card p-4">
            <Truck className="text-alien" size={22} />
            <div>
              <p className="text-sm font-medium text-fog">Delivery</p>
              <p className="text-xs text-fog-dim">We deliver to all cities across Iraq</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-edge bg-card p-4">
            <Clock className="text-alien" size={22} />
            <div>
              <p className="text-sm font-medium text-fog">Order confirmation</p>
              <p className="text-xs text-fog-dim">We confirm every order by phone before delivery</p>
            </div>
          </div>
        </div>

        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mx-auto block w-44 rounded-2xl border border-edge bg-white p-3"
          title="Scan to follow on Instagram"
        >
          <Image
            src="/instagram-qr.png"
            alt="Scan to follow @alienhub.store on Instagram"
            width={400}
            height={400}
            className="h-auto w-full"
          />
          <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-wider text-fog-dim">
            Scan to follow
          </p>
        </a>
      </div>
    </main>
  );
}
