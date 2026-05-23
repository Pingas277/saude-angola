"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MoreVertical,
  X,
  ArrowUpRight,
  Workflow,
  Stethoscope,
  Heart,
  Mail,
  type LucideIcon,
} from "lucide-react";

// Landing-page mobile navigation. Trigger is a 3-vertical-dots button.
// Opens a full-height sheet from below the sticky header — feels like an
// in-app menu, not a tiny dropdown. The other landing sections (Preços,
// Perguntas) are reachable by scrolling the page.

type NavItem = {
  href: string;
  label: string;
  desc: string;
  icon: LucideIcon;
};

const ITEMS: NavItem[] = [
  {
    href: "#como",
    label: "Como funciona",
    desc: "Três passos. É tudo.",
    icon: Workflow,
  },
  {
    href: "#procurar",
    label: "Procurar médico",
    desc: "Por especialidade ou província.",
    icon: Stethoscope,
  },
  {
    href: "/sobre",
    label: "Sobre nós",
    desc: "A missão da Lunga.",
    icon: Heart,
  },
  {
    href: "#contacto",
    label: "Contacto",
    desc: "Fale connosco.",
    icon: Mail,
  },
];

// Emil-tuned curves. iOS drawer for the sheet (weighty start), softer
// ease-out-quint for the inner items. Asymmetric duration — opening
// earns time, closing snaps.
const EASE_SHEET = [0.32, 0.72, 0, 1] as const;
const EASE_FADE = [0.4, 0, 0.2, 1] as const;
const EASE_ITEM = [0.2, 0.8, 0.2, 1] as const;

// Sticky header height — anchor scroll lands this far below the top so
// the section title isn't hidden under the header.
const HEADER_OFFSET = 80;

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  // Body scroll lock, Escape closes, auto-close on resize past md.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);

    const mq = window.matchMedia("(min-width: 768px)");
    const onResize = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    mq.addEventListener("change", onResize);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onResize);
    };
  }, [open]);

  // Anchor click: close the sheet, then offset-aware smooth scroll. The
  // 120ms delay lets the sheet start fading so the scroll motion is
  // already in progress by the time the page is visible behind it.
  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (!href.startsWith("#")) return; // route link — let Next handle it
    e.preventDefault();
    setOpen(false);
    const id = href.slice(1);
    window.setTimeout(() => {
      const el = document.getElementById(id);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
      window.scrollTo({ top, behavior: "smooth" });
    }, 120);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
        aria-controls="mobile-nav-sheet"
        className="grid size-10 place-items-center rounded-lg text-foreground transition-[background-color,transform] duration-150 ease-out hover:bg-accent active:scale-90 md:hidden"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="x"
              initial={{ opacity: 0, rotate: -90, scale: 0.85 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.85 }}
              transition={{ duration: 0.18, ease: EASE_FADE }}
              className="inline-flex"
            >
              <X className="size-5" />
            </motion.span>
          ) : (
            <motion.span
              key="dots"
              initial={{ opacity: 0, rotate: 90, scale: 0.85 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -90, scale: 0.85 }}
              transition={{ duration: 0.18, ease: EASE_FADE }}
              className="inline-flex"
            >
              <MoreVertical className="size-5" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="sheet"
            id="mobile-nav-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
              duration: open ? 0.32 : 0.2,
              ease: EASE_SHEET,
            }}
            className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto md:hidden"
          >
            {/* Background — brand-toned gradient + dot pattern + soft orbs */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-50 via-background to-emerald-50" />
            <div
              aria-hidden
              className="pointer-events-none absolute -left-32 -top-24 size-[420px] rounded-full bg-gradient-to-br from-sky-300/25 to-transparent blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 -right-32 size-[420px] rounded-full bg-gradient-to-br from-emerald-300/25 to-transparent blur-3xl"
            />
            <svg
              aria-hidden
              className="pointer-events-none absolute inset-0 size-full opacity-[0.05] text-foreground"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="mobile-nav-dots"
                  x="0"
                  y="0"
                  width="18"
                  height="18"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="1" cy="1" r="1" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#mobile-nav-dots)" />
            </svg>

            {/* Content */}
            <div className="relative flex min-h-full flex-col px-5 pb-8 pt-7">
              {/* Eyebrow */}
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.36, delay: 0.06, ease: EASE_ITEM }}
                className="mb-5 text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground"
              >
                Menu
              </motion.div>

              {/* Nav cards */}
              <nav>
                <ul className="flex flex-col gap-2.5">
                  {ITEMS.map((item, i) => (
                    <motion.li
                      key={item.href}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.1 + i * 0.05,
                        ease: EASE_ITEM,
                      }}
                    >
                      <Link
                        href={item.href}
                        onClick={(e) => handleAnchorClick(e, item.href)}
                        className="group/row flex items-center gap-4 rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm backdrop-blur-sm transition-[background-color,transform,border-color,box-shadow] duration-200 ease-out hover:border-primary/40 hover:bg-card hover:shadow-md active:scale-[0.985]"
                      >
                        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-sky-100 to-emerald-100 text-primary ring-1 ring-primary/15 transition-transform duration-200 ease-out group-hover/row:scale-105">
                          <item.icon className="size-5" strokeWidth={2.25} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-base font-semibold text-foreground">
                            {item.label}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                            {item.desc}
                          </span>
                        </span>
                        <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-[transform,color] duration-200 ease-out group-hover/row:-translate-y-0.5 group-hover/row:translate-x-0.5 group-hover/row:text-primary" />
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              {/* Spacer — pins the auth footer to the bottom */}
              <div className="flex-1" />

              {/* Auth row */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 0.1 + ITEMS.length * 0.05,
                  ease: EASE_ITEM,
                }}
                className="mt-10"
              >
                <div className="mb-3 flex items-center justify-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  <Image
                    src="/brand/logo-mark.png"
                    alt=""
                    width={16}
                    height={16}
                    className="opacity-70"
                  />
                  <span>Saúde no telemóvel</span>
                </div>
                <div className="flex gap-2.5">
                  <Link
                    href="/entrar"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-xl border border-border bg-background/80 px-4 py-3 text-center text-sm font-semibold text-foreground shadow-sm backdrop-blur-sm transition-[background-color,transform,border-color] duration-150 ease-out hover:border-foreground/30 hover:bg-background active:scale-[0.97]"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/registar"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-xl bg-gradient-to-br from-sky-600 to-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-md shadow-primary/20 transition-[transform,box-shadow] duration-150 ease-out hover:shadow-lg hover:shadow-primary/30 active:scale-[0.97]"
                  >
                    Criar conta
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
