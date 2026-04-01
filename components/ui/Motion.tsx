"use client";

import type { PropsWithChildren } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface FadeInProps {
  delay?: number;
  className?: string;
}

export function FadeIn({ children, className, delay = 0 }: PropsWithChildren<FadeInProps>) {
  const shouldReduceMotion = useReducedMotion();

  // Respect reduced-motion preferences while keeping entrances subtle for everyone else.
  const initial = shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 18 };
  const animate = shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 };

  return (
    <motion.div
      animate={animate}
      className={className}
      initial={initial}
      transition={{ duration: 0.38, ease: "easeOut", delay }}
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
            staggerChildren: shouldReduceMotion ? 0 : 0.08
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
        hidden: { opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 16 },
        show: { opacity: 1, y: 0 }
      }}
      transition={{ duration: 0.32, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
