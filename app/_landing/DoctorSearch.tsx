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
  Building2,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { coerceWorkingHours, openStatus } from "@/lib/slots";

/**
 * Landing-page live clinic search. Renamed conceptually from doctor-first
 * to clinic-first per mentor feedback ("começa pela clínica, escolhe a
 * categoria/médico depois"). Component name stayed DoctorSearch so the
 * existing imports + section anchors in page.tsx don't change.
 */

type Clinic = {
  id: string;
  name: string;
  province: string | null;
  address: string | null;
  working_hours: unknown;
  doctors_count: number;
  specialties: string[];
};

// Anyone clicking 'Marcar' on a specific clinic goes through registration
// and lands inside that clinic's doctor list.
function bookHref(clinicId: string): string {
  return `/registar?redirect=${encodeURIComponent(`/painel/marcar?clinica=${clinicId}`)}`;
}
const REGISTER_HREF = "/registar?redirect=%2Fpainel%2Fmarcar";

export default function DoctorSearch() {
  const supabase = useMemo(() => createClient(), []);
  const [query, setQuery] = useState("");
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const reqId = useRef(0);

  useEffect(() => {
    const id = ++reqId.current;
    setLoading(true);
    const t = setTimeout(async () => {
      const { data } = await supabase.rpc("search_clinics", {
        q: query.trim(),
      });
      if (id !== reqId.current) return; // stale response
      setClinics((data as Clinic[] | null) ?? []);
      setLoading(false);
    }, 280);
    return () => clearTimeout(t);
  }, [query, supabase]);

  // Pre-baked specialty quick-filters derived from the current visible
  // clinics — picking one re-runs the search with that term.
  const popularSpecialties = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of clinics) {
      for (const s of c.specialties) {
        counts.set(s, (counts.get(s) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([s]) => s);
  }, [clinics]);

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
            placeholder="Nome da clínica, província, especialidade…"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
            aria-label="Pesquisar clínicas"
          />
          {loading && (
            <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
          )}
        </div>

        {popularSpecialties.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {popularSpecialties.map((s) => {
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
        {loading && clinics.length === 0 ? (
          <ul className="divide-y divide-border">
            {[0, 1, 2, 3].map((i) => (
              <li key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="size-11 shrink-0 animate-pulse rounded-xl bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-40 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-56 animate-pulse rounded bg-muted" />
                </div>
              </li>
            ))}
          </ul>
        ) : clinics.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
              <Search className="size-6" />
            </span>
            <p className="mt-4 text-sm font-medium text-foreground">
              Nenhuma clínica encontrada
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tente outro nome, província ou especialidade.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {clinics.slice(0, 8).map((c) => {
              const status = openStatus(coerceWorkingHours(c.working_hours));
              return (
                <li
                  key={c.id}
                  className="group flex flex-wrap items-center gap-4 px-5 py-4 transition-colors hover:bg-accent/40"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-sm">
                    <Building2 className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-foreground">
                      {c.name}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      {c.province && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3" />
                          {c.province}
                        </span>
                      )}
                      <span aria-hidden className="text-border">
                        ·
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="size-3" />
                        {c.doctors_count}{" "}
                        {c.doctors_count === 1 ? "médico" : "médicos"}
                      </span>
                      {c.specialties.length > 0 && (
                        <>
                          <span aria-hidden className="text-border">
                            ·
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Stethoscope className="size-3" />
                            {c.specialties[0]}
                            {c.specialties.length > 1
                              ? ` +${c.specialties.length - 1}`
                              : ""}
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
                    href={bookHref(c.id)}
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
          {clinics.length > 8 ? (
            <>
              <span className="font-semibold text-foreground">
                +{clinics.length - 8}
              </span>{" "}
              outras clínicas disponíveis ·{" "}
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
