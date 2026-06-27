"use client";

import { motion } from "framer-motion";

// A template re-mounts on every navigation, so this animates each storefront
// page as it enters (fade + slight rise) — pressing Shop/Contact/etc. feels alive.
export default function StoreTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
