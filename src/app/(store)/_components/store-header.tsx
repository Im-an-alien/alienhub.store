"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { ShoppingCart, Search, Home, Menu, X } from "lucide-react";
import { useCart, cartCount } from "@/lib/cart-store";
import { ThemeToggle } from "@/components/theme-toggle";

const MotionLink = motion.create(Link);

const NAV = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Products" },
  { href: "/bundles", label: "Bundles" },
  { href: "/cart", label: "Cart" },
  { href: "/contact", label: "Contact" },
];

const hover = { scale: 1.06 };
const tap = { scale: 0.92 };
const spring = { type: "spring" as const, stiffness: 400, damping: 22 };

const drawer: Variants = {
  hidden: { x: "-100%" },
  show: {
    x: 0,
    transition: { type: "spring", stiffness: 260, damping: 30, when: "beforeChildren", staggerChildren: 0.07 },
  },
  exit: { x: "-100%", transition: { duration: 0.25, ease: "easeInOut" } },
};
const drawerItem: Variants = {
  hidden: { opacity: 0, x: -28 },
  show: { opacity: 1, x: 0 },
};

export function StoreHeader() {
  const items = useCart((s) => s.items);
  const [mounted, setMounted] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => setMounted(true), []);
  const count = mounted ? cartCount(items) : 0;

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      if (y > lastY.current && y > 80) setHidden(true);
      else setHidden(false);
      lastY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-transform duration-300 ${
          hidden && !menuOpen ? "-translate-y-[160%]" : "translate-y-0"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:gap-3">
          {/* Mobile: menu button */}
          <motion.button
            type="button"
            whileTap={tap}
            whileHover={hover}
            transition={spring}
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="glass relative flex h-10 w-10 items-center justify-center rounded-full text-fog sm:hidden"
          >
            <Menu size={18} />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-alien px-1 text-[11px] font-bold text-black">
                {count}
              </span>
            )}
          </motion.button>

          {/* Desktop nav */}
          <div className="hidden items-center gap-2 sm:flex sm:gap-3">
            <MotionLink href="/" aria-label="Home" whileHover={hover} whileTap={tap} transition={spring} className="glass flex h-9 w-9 items-center justify-center rounded-full text-fog hover:text-alien">
              <Home size={16} />
            </MotionLink>
            <MotionLink href="/shop" whileHover={hover} whileTap={tap} transition={spring} className="glass rounded-full px-4 py-2 text-sm text-fog hover:text-alien">Shop</MotionLink>
            <MotionLink href="/bundles" whileHover={hover} whileTap={tap} transition={spring} className="glass rounded-full px-4 py-2 text-sm text-fog hover:text-alien">Bundles</MotionLink>
            <MotionLink href="/contact" whileHover={hover} whileTap={tap} transition={spring} className="glass rounded-full px-4 py-2 text-sm text-fog hover:text-alien">Contact</MotionLink>
          </div>

          <form action="/search" method="get" className="relative ml-auto hidden sm:block sm:w-56">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fog-dim" />
            <input
              name="q"
              placeholder="Search gear…"
              className="glass w-full rounded-full py-2 pl-9 pr-3 text-sm text-fog outline-none placeholder:text-fog-dim focus:ring-1 focus:ring-alien-dim"
            />
          </form>

          {/* Desktop right cluster */}
          <div className="ml-auto hidden items-center gap-2 sm:flex sm:ml-0">
            <ThemeToggle />
            <MotionLink href="/cart" whileHover={hover} whileTap={tap} transition={spring} className="glass relative flex items-center gap-2 rounded-full px-4 py-2 text-sm text-fog hover:text-alien">
              <ShoppingCart size={16} />
              <span>Cart</span>
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-alien px-1 text-[11px] font-bold text-black">
                  {count}
                </span>
              )}
            </MotionLink>
          </div>
        </div>
      </header>

      {/* Mobile fullscreen menu (slides in) */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            variants={drawer}
            initial="hidden"
            animate="show"
            exit="exit"
            className="fixed inset-0 z-[60] flex flex-col bg-space sm:hidden"
          >
            <div className="flex items-center justify-between px-4 py-3">
              <motion.button
                type="button"
                whileTap={tap}
                whileHover={hover}
                transition={spring}
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="glass flex h-10 w-10 items-center justify-center rounded-full text-fog"
              >
                <X size={18} />
              </motion.button>
              <ThemeToggle />
            </div>

            <nav className="flex flex-1 flex-col justify-center gap-4 px-8">
              {NAV.map((l, i) => (
                <motion.div key={l.href} variants={drawerItem}>
                  <Link
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className="group flex items-baseline gap-4"
                  >
                    <span className="font-mono text-sm text-alien">0{i + 1}</span>
                    <span className="font-display text-4xl font-black text-fog transition group-hover:text-alien">
                      {l.label}
                      {l.href === "/cart" && count > 0 ? ` (${count})` : ""}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            <motion.div variants={drawerItem} className="px-8 pb-12">
              <form action="/search" method="get" className="relative">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fog-dim" />
                <input
                  name="q"
                  placeholder="Search gear…"
                  className="glass w-full rounded-full py-3 pl-10 pr-3 text-sm text-fog outline-none placeholder:text-fog-dim"
                />
              </form>
              <a
                href="https://www.instagram.com/alienhub.store"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-block text-sm text-fog-dim hover:text-alien"
              >
                @alienhub.store
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
