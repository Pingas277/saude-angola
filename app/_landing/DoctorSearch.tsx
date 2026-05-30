"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Stethoscope,
  ArrowRight,
  Loader2,
  UserPlus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { coerceWorkingHours, openStatus } from "@/lib/slots";

type Doc = {
  id: string;
  full_name: string | null;
  specialty: string | null;
  clinic_name: string | null;
  province: string | null;
  working_hours: unknown;
};

const REGISTER_HREF = "/registar?redirect=%2Fpainel%2Fmarcar";

function initials(name: string | null): string {
  if (!name) return "Dr";
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[p.length - 1]?.[0] ?? "")).toUpperCase();
}

export default function DoctorSearch() {
  const supabase = useMemo(() => createClient(), []);
  const [query, setQuery] = useState("");
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const reqId = useRef(0);

  useEffect(() => {
    const id = ++reqId.current;
    setLoading(true);
    const t = setTimeout(async () => {
      const { data } = await supabase.rpc("search_doctors", {
        q: query.trim(),
      });
      if (id !== reqId.current) return; // stale response
      setDocs((data as Doc[] | null) ?? []);
      setLoading(false);
    }, 280);
    return () => clearTimeout(t);
  }, [query, supabase]);

  const specialties = useMemo(() => {
    const s = new Set<string>();
    for (const d of docs) if (d.specialty) s.add(d.specialty);
    return [...s].slice(0, 6);
  }, [docs]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Search bar */}
      <div className="border-b border-border p-4 sm:p-5">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Especialidade, clínica, província ou nome do médico…"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
            aria-label="Pesquisar médicos"
          />
          {loading && (
            <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
          )}
        </div>

        {specialties.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {specialties.map((s) => {
              const active = query.trim().toLowerCase() === s.toLowerCase();
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setQuery(active ? "" : s)}
                  className={
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-colors " +
                    (active
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-muted-foreground hover:text-foreground")
                  }
                >
                  {s}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="min-h-[260px]">
        {loading && docs.length === 0 ? (
          <ul className="divide-y divide-border">
            {[0, 1, 2, 3].map((i) => (
              <li key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="size-11 shrink-0 animate-pulse rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-40 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-56 animate-pulse rounded bg-muted" />
                </div>
              </li>
            ))}
          </ul>
        ) : docs.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
              <Search className="size-6" />
            </span>
            <p className="mt-4 text-sm font-medium text-foreground">
              Nenhum médico encontrado
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tente outra especialidade, clínica ou província.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {docs.slice(0, 8).map((d) => {
              const status = openStatus(coerceWorkingHours(d.working_hours));
              return (
              <li
                key={d.id}
                className="group flex flex-wrap items-center gap-4 px-5 py-4 transition-colors hover:bg-accent/40"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {initials(d.full_name)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-foreground">
                    Dr(a). {d.full_name}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Stethoscope className="size-3" />
                      {d.specialty ?? "Medicina Geral"}
                    </span>
                    {d.clinic_name && (
                      <>
                        <span aria-hidden className="text-border">
                          ·
                        </span>
                        <span>{d.clinic_name}</span>
                      </>
                    )}
                    {d.province && (
                      <>
                        <span aria-hidden className="text-border">
                          ·
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3" />
                          {d.province}
                        </span>
                      </>
                    )}
                    <span aria-hidden className="text-border">
                      ·
                    </span>
                    <span
                      className={
                        "inline-flex items-center gap-1 font-medium " +
                        (status.open
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-muted-foreground")
                      }
                    >
                      <span
                        className={
                          "size-1.5 rounded-full " +
                          (status.open
                            ? "bg-emerald-500"
                            : "bg-muted-foreground/40")
                        }
                      />
                      {status.label}
                    </span>
                  </div>
                </div>
                <Link
                  href={REGISTER_HREF}
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Marcar
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Account CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/40 px-5 py-4">
        <p className="text-sm text-muted-foreground">
          {docs.length > 8 ? (
            <>
              <span className="font-semibold text-foreground">
                +{docs.length - 8}
              </span>{" "}
              outros médicos disponíveis ·{" "}
            </>
          ) : null}
          Crie conta para ver disponibilidade e marcar.
        </p>
        <Link
          href={REGISTER_HREF}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <UserPlus className="size-4" />
          Criar conta grátis
        </Link>
      </div>
    </div>
  );
}
