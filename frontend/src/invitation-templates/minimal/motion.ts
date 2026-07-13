import type { Variants } from "framer-motion";

export const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 42 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.78, ease: "easeOut" },
  },
};

export const copyReveal: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: "easeOut" },
  },
};

export const photoReveal: Variants = {
  hidden: { opacity: 0, scale: 1.035 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.05, ease: "easeOut" },
  },
};

export const illustrationReveal: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.1, ease: "easeOut", delay: 0.15 },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.08 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.56, ease: "easeOut" },
  },
};

export const revealViewport = { amount: 0.16, once: true };
