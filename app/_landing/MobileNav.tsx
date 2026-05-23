"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { MoreVertical, X } from "lucide-react";

// Landing-page mobile navigation. Stripe/Vercel pattern: small dropdown
// panel below the header, plain text links, one quick animation. Not a
// full-screen takeover. Preços / Perguntas are reachable by scrolling.

const ITEMS: Array<{ href: string; label: string }> = [
  { href: "#como", label: "Como funciona" },
  { href: "#procurar", label: "Procurar médico" },
  { href: "/sobre", label: "Sobre nós" },
  { href: "#contacto", label: "Contacto" },
];

const HEADER_OFFSET = 80;

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  // Portal mount gate — see fix note: backdrop-blur on header creates a
  // containing block, so the panel needs to live on <body> instead.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Escape closes, auto-close on resize past md. No body scroll lock —
  // panel is small, doesn't take over the screen, scrolling is fine.
  useEffect(() => {
    if (!open) return;
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
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onResize);
    };
  }, [open]);

  // Anchor click: close panel, then offset-aware smooth scroll. The 80ms
  // delay sits inside the panel's exit so the scroll motion is already
  // happening as the panel fades.
  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (!href.startsWith("#")) return;
    e.preventDefault();
    setOpen(false);
    const id = href.slice(1);
    window.setTimeout(() => {
      const el = document.getElementById(id);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
      window.scrollTo({ top, behavior: "smooth" });
    }, 80);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        className="grid size-10 place-items-center rounded-lg text-foreground transition-[background-color,transform] duration-150 ease-out hover:bg-accent active:scale-90 md:hidden"
      >
        {open ? (
          <X className="size-5" />
        ) : (
          <MoreVertical className="size-5" />
        )}
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                {/* Invisible tap-to-close layer — no blur, no color */}
                <motion.button
                  key="backdrop"
                  type="button"
                  aria-label="Fechar menu"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  onClick={() => setOpen(false)}
                  className="fixed inset-0 top-16 z-40 cursor-default bg-black/5 md:hidden"
                />
                {/* Panel — small dropdown, top-right corner, auto-height */}
                <motion.div
                  key="panel"
                  id="mobile-nav-panel"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Menu"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
                  className="fixed right-3 top-[68px] z-50 w-60 overflow-hidden rounded-xl border border-border bg-card shadow-lg md:hidden"
                  style={{ transformOrigin: "top right" }}
                >
                  <nav className="py-1.5">
                    {ITEMS.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={(e) => handleAnchorClick(e, item.href)}
                        className="block px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent active:bg-accent"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                  <div className="border-t border-border bg-muted/40 p-2">
                    <Link
                      href="/entrar"
                      onClick={() => setOpen(false)}
                      className="block rounded-md px-3 py-2 text-center text-sm font-medium text-foreground transition-colors hover:bg-accent"
                    >
                      Entrar
                    </Link>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
