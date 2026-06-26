"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  MessageSquare,
  LogOut,
} from "lucide-react";
import { logoutAction } from "../../auth-actions";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
];

export function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-edge bg-surface">
      <div className="border-b border-edge px-5 py-4">
        <p className="font-display text-sm font-black tracking-wide text-fog">
          ALIENHUB<span className="text-alien">.STORE</span>
        </p>
        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-fog-dim">
          Admin Console
        </p>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {LINKS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                active
                  ? "bg-alien/10 text-alien"
                  : "text-fog-dim hover:bg-card hover:text-fog",
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-edge p-3">
        <p className="px-2 pb-2 font-mono text-[10px] text-fog-dim">{adminName}</p>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-fog-dim transition hover:bg-card hover:text-danger"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
