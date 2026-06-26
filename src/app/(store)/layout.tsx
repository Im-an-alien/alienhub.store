import Link from "next/link";
import { InstagramIcon } from "@/components/icons";
import { StoreHeader } from "./_components/store-header";

const INSTAGRAM_URL = "https://www.instagram.com/alienhub.store";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <StoreHeader />
      <div className="flex-1 pt-16">{children}</div>

      <footer className="border-t border-edge bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-fog-dim md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-base font-bold text-fog">
              ALIENHUB<span className="text-alien">.STORE</span>
            </p>
            <p className="mt-1 text-xs">Signal Received. Tech Acquired.</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/shop" className="hover:text-alien">Shop</Link>
            <Link href="/contact" className="hover:text-alien">Contact</Link>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-alien"
            >
              <InstagramIcon size={15} /> @alienhub.store
            </a>
          </div>
        </div>
        <div className="border-t border-edge py-3 text-center text-[11px] text-fog-dim">
          © {new Date().getFullYear()} AlienHub.Store
        </div>
      </footer>
    </div>
  );
}
