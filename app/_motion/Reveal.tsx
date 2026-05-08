"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

// =============================================================================
// Motion primitives for A-grade SaaS feel
// Subtle, formal, performant. Tuned for healthcare context (no bouncy springs).
// =============================================================================

const EASE = [0.16, 1, 0.3, 1] as const; // ease-out-quint, smooth + fast settle

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.55, ease: EASE },
  },
};

const staggerParent: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

/**
 * Drop-in wrapper that fades + slides its content in when it enters the
 * viewport. Use it around individual sections or hero blocks.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "header";
}) {
  const MotionTag = motion[as];
  return (
    <MotionTag
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeUp}
      transition={{ duration: 0.6, ease: EASE, delay }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Container that fades its direct children in sequence (stagger).
 * Children should be `<StaggerItem>` to participate.
 */
export function Stagger({
  children,
  className,
  delay = 0,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "ul";
}) {
  const MotionTag = motion[as];
  return (
    <MotionTag
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        ...staggerParent,
        visible: {
          ...staggerParent.visible,
          transition: {
            staggerChildren: 0.08,
            delayChildren: 0.05 + delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article" | "figure";
}) {
  const MotionTag = motion[as];
  return (
    <MotionTag variants={fadeUp} className={className}>
      {children}
    </MotionTag>
  );
}

/**
 * Card with smooth spring hover lift. Drop-in replacement for a static <div>.
 */
export function HoverLift({
  children,
  className,
  href,
}: {
  children: ReactNode;
  className?: string;
  href?: string;
}) {
  const props = {
    whileHover: { y: -4 },
    transition: { type: "spring", stiffness: 300, damping: 24 } as const,
    className,
  };
  if (href) {
    return (
      <motion.a href={href} {...props}>
        {children}
      </motion.a>
    );
  }
  return <motion.div {...props}>{children}</motion.div>;
}
