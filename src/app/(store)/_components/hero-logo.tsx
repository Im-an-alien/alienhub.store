"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";

const MotionLink = motion.create(Link);

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.15 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.2, 0.8, 0.2, 1] } },
};

export function HeroLogo() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center text-center"
    >
      <motion.div variants={item}>
        <Image
          src="/logo.png"
          alt="Alien Hub"
          width={700}
          height={116}
          priority
          className="h-auto w-64 drop-shadow-[0_2px_30px_rgba(140,255,158,0.25)] sm:w-[26rem]"
        />
      </motion.div>

      <motion.p
        variants={item}
        className="mt-6 max-w-md font-mono text-[11px] uppercase tracking-[0.25em] text-fog-dim sm:text-xs"
      >
        Alien-grade gaming gear · delivered across Iraq
      </motion.p>

      <motion.div variants={item} className="mt-8">
        <MotionLink
          href="/shop"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          className="inline-block rounded-full bg-alien px-8 py-3 font-display text-xs font-bold uppercase tracking-widest text-black transition-colors hover:bg-alien-dim"
        >
          Shop all gear
        </MotionLink>
      </motion.div>
    </motion.div>
  );
}
