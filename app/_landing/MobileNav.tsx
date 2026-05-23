"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { MoreVertical, X } from "lucide-react";

// Landing-page mobile navigation. maispecas.co.ao pattern: right-side
// drawer in brand color, all-caps links, slides in from the edge.
// Trigger stays as the 3-dot kebab (user preference).

const ITEMS: Array<{ href: string; label: string }> = [
  { href: "#como", label: "Como funciona" },
  { href: "#procurar", label: "Procurar médico" },
  { href: "/sobre", label: "Sobre nós" },
  { href: "#contacto", label: "Contacto" },
];

const HEADER_OFFSET = 80;

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  // Portal mount gate — sheet lives on <body> so the header's
  // backdrop-blur containing block doesn't trap fixed positioning.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Body scroll lock while drawer is open; Escape closes; auto-close on
  // resize past md so a window resize never leaves the drawer stuck.
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

  // Anchor click: close drawer, then offset-aware smooth scroll. 180ms
  // delay lets the drawer slide most of the way out before the scroll
  // starts so the page motion isn't fighting the drawer motion.
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
    }, 180);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
        className="grid size-10 place-items-center rounded-lg text-foreground transition-[background-color,transform] duration-150 ease-out hover:bg-accent active:scale-90 md:hidden"
      >
        <MoreVertical className="size-5" />
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                {/* Dark backdrop — tap to close. */}
                <motion.button
                  key="backdrop"
                  type="button"
                  aria-label="Fechar menu"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  onClick={() => setOpen(false)}
                  className="fixed inset-0 z-40 cursor-default bg-black/50 md:hidden"
                />

                {/* Right-side drawer — brand-color gradient, full height. */}
                <motion.div
                  key="drawer"
                  id="mobile-nav-drawer"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Menu de navegação"
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
                  className="fixed inset-y-0 right-0 z-50 flex w-[78%] max-w-[340px] flex-col bg-gradient-to-br from-sky-600 via-sky-700 to-emerald-700 text-white shadow-2xl md:hidden"
                >
                  {/* Top bar with close button */}
                  <div className="flex h-16 items-center justify-between px-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.32em] text-white/70">
                      Menu
                    </span>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      aria-label="Fechar menu"
                      className="grid size-10 place-items-center rounded-lg text-white transition-[background-color,transform] duration-150 ease-out hover:bg-white/15 active:scale-90"
                    >
                      <X className="size-5" />
                    </button>
                  </div>

                  {/* Links — all caps, bold, white-on-brand, separators */}
                  <nav className="flex-1 overflow-y-auto px-2 pt-2">
                    {ITEMS.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={(e) => handleAnchorClick(e, item.href)}
                        className="block border-b border-white/10 px-3 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition-[background-color,transform] duration-150 ease-out hover:bg-white/10 active:scale-[0.99] active:bg-white/15"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>

                  {/* Auth row — pinned to bottom of drawer */}
                  <div className="border-t border-white/15 bg-black/10 p-3">
                    <div className="flex flex-col gap-2">
                      <Link
                        href="/entrar"
                        onClick={() => setOpen(false)}
                        className="block rounded-lg border border-white/30 bg-white/5 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.16em] text-white shadow-sm transition-[background-color,border-color,transform] duration-150 ease-out hover:border-white/60 hover:bg-white/15 active:scale-[0.97]"
                      >
                        Entrar
                      </Link>
                      <Link
                        href="/registar"
                        onClick={() => setOpen(false)}
                        className="block rounded-lg bg-white px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.16em] text-sky-700 shadow-md transition-[background-color,transform,box-shadow] duration-150 ease-out hover:bg-white/95 hover:shadow-lg active:scale-[0.97]"
                      >
                        Criar conta
                      </Link>
                    </div>
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
