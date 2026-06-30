import type { Variants } from "framer-motion";

export {
  formatDate,
  formatMonth,
  getCalendarDays,
  parseDate,
} from "@/lib/invite-date";

export const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 58, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.78, ease: "easeOut" },
  },
};

export const photoReveal: Variants = {
  hidden: { opacity: 0, scale: 1.08 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.15, ease: "easeOut" },
  },
};

export const copyReveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: "easeOut", delay: 0.16 },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.08 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.52, ease: "easeOut" },
  },
};

export const revealViewport = { amount: 0.22, once: false };
