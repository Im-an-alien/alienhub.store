"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export function HeroLogo() {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <Image
          src="/logo.png"
          alt="Alien Hub"
          width={700}
          height={116}
          priority
          className="h-auto w-64 drop-shadow-[0_2px_30px_rgba(140,255,158,0.25)] sm:w-[26rem]"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="mt-14"
        aria-hidden="true"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="text-fog-dim"
        >
          <ChevronDown size={26} />
        </motion.div>
      </motion.div>
    </div>
  );
}
