import type { Variants } from "framer-motion";

const snapEase = [0.22, 1, 0.36, 1] as const;

export const heroSequence: Variants = {
  hidden: {},
  visible: {
    transition: { delayChildren: 0.08, staggerChildren: 0.09 },
  },
};

export const mastheadReveal: Variants = {
  hidden: { opacity: 0, y: -24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: snapEase } },
};

export const nameFromLeft: Variants = {
  hidden: { opacity: 0, x: -72 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.72, ease: snapEase } },
};

export const nameFromRight: Variants = {
  hidden: { opacity: 0, x: 72 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.72, ease: snapEase } },
};

export const plusReveal: Variants = {
  hidden: { opacity: 0, rotate: -90, scale: 0.2 },
  visible: {
    opacity: 1,
    rotate: 0,
    scale: 1,
    transition: { duration: 0.56, ease: snapEase },
  },
};

export const photoMaskReveal: Variants = {
  hidden: { clipPath: "inset(100% 0 0 0)" },
  visible: {
    clipPath: "inset(0% 0 0 0)",
    transition: { duration: 1.05, ease: snapEase },
  },
};

export const archPhotoReveal: Variants = {
  hidden: { clipPath: "inset(100% 0 0 0 round 50% 50% 3px 3px)" },
  visible: {
    clipPath: "inset(0% 0 0 0 round 50% 50% 3px 3px)",
    transition: { duration: 1.05, ease: snapEase },
  },
};

export const dateReveal: Variants = {
  hidden: { opacity: 0, y: 72 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: snapEase } },
};

export const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 54 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.68, ease: snapEase } },
};

export const copyFromLeft: Variants = {
  hidden: { opacity: 0, x: -42 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.64, ease: snapEase } },
};

export const copyFromRight: Variants = {
  hidden: { opacity: 0, x: 42 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.64, ease: snapEase } },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.08, staggerChildren: 0.08 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.52, ease: snapEase } },
};

export const revealViewport = { amount: 0.16, once: true };
