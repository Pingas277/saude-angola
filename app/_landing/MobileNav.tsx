"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MoreVertical, X, ArrowRight } from "lucide-react";

// Landing-page mobile navigation. Trigger is a 3-vertical-dots button
// (user-requested). Opens a sheet from below the sticky header with the
// same links as the desktop nav, plus Sobre / Contacto / Entrar that the
// desktop layout drops onto the page itself.

const ITEMS: Array<{ href: string; label: string }> = [
  { href: "#como", label: "Como funciona" },
  { href: "#procurar", label: "Procurar médico" },
  { href: "#precos", label: "Preços" },
  { href: "/sobre", label: "Sobre nós" },
  { href: "#contacto", label: "Contacto" },
  { href: "#faq", label: "Perguntas" },
];

// Emil-tuned curves. Sheet: iOS drawer, weighty start. Backdrop: standard
// material ease. Asymmetric duration — opening earns time, closing snaps.
const EASE_SHEET = [0.32, 0.72, 0, 1] as const;
const EASE_FADE = [0.4, 0, 0.2, 1] as const;

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  // Lock body scroll, listen for Escape, auto-close when crossing into
  // the desktop breakpoint so a window resize never leaves the sheet stuck.
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
          <>
            {/* Backdrop — sits below the header, above the page. */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: EASE_FADE }}
              onClick={() => setOpen(false)}
              className="fixed inset-x-0 bottom-0 top-16 z-40 bg-foreground/30 backdrop-blur-[2px] md:hidden"
              aria-hidden
            />

            {/* Sheet — translates down from under the header. */}
            <motion.div
              key="sheet"
              id="mobile-nav-sheet"
              role="dialog"
              aria-modal="true"
              aria-label="Menu de navegação"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{
                duration: open ? 0.28 : 0.18,
                ease: EASE_SHEET,
              }}
              className="fixed inset-x-0 top-16 z-50 border-b border-border bg-background/95 shadow-xl backdrop-blur-xl md:hidden"
            >
              <nav className="mx-auto max-w-6xl px-4 py-3">
                <ul className="flex flex-col">
                  {ITEMS.map((item, i) => (
                    <motion.li
                      key={item.href}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.32,
                        delay: 0.06 + i * 0.035,
                        ease: [0.2, 0.8, 0.2, 1],
                      }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-between rounded-lg px-3 py-3.5 text-base font-medium text-foreground transition-[background-color,transform] duration-150 ease-out hover:bg-accent active:scale-[0.98] active:bg-accent"
                      >
                        <span>{item.label}</span>
                        <ArrowRight className="size-4 text-muted-foreground" />
                      </Link>
                    </motion.li>
                  ))}
                </ul>

                {/* Auth row — separated, lower-priority below the nav. */}
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.32,
                    delay: 0.06 + ITEMS.length * 0.035,
                    ease: [0.2, 0.8, 0.2, 1],
                  }}
                  className="mt-2 flex gap-2 border-t border-border px-1 pt-3"
                >
                  <Link
                    href="/entrar"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-center text-sm font-semibold text-foreground transition-[background-color,transform] duration-150 ease-out hover:bg-accent active:scale-[0.97]"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/registar"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground transition-[background-color,transform] duration-150 ease-out hover:bg-primary/90 active:scale-[0.97]"
                  >
                    Criar conta
                  </Link>
                </motion.div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
