"use client";

import type { PropsWithChildren } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface FadeInProps {
  delay?: number;
  className?: string;
}

const easeOut = [0.22, 1, 0.36, 1] as const;

export function FadeIn({ children, className, delay = 0 }: PropsWithChildren<FadeInProps>) {
  const shouldReduceMotion = useReducedMotion();

  const initial = shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 22, scale: 0.985 };
  const animate = shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 };

  return (
    <motion.div
      animate={animate}
      className={className}
      initial={initial}
      transition={{ duration: shouldReduceMotion ? 0 : 0.48, ease: easeOut, delay }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerGroup({ children, className }: PropsWithChildren<{ className?: string }>) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate="show"
      className={className}
      initial="hidden"
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: shouldReduceMotion ? 0 : 0.1,
            delayChildren: shouldReduceMotion ? 0 : 0.04
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: PropsWithChildren<{ className?: string }>) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 18, scale: shouldReduceMotion ? 1 : 0.985 },
        show: { opacity: 1, y: 0, scale: 1 }
      }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.42, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}
