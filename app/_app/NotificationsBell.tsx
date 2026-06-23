"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CalendarCheck,
  CheckCheck,
  FileText,
  Pill,
  Receipt,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  markAllNotificationsReadAction,
  markNotificationsReadAction,
} from "./notifications-actions";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

const TYPE_ICON: Record<string, LucideIcon> = {
  lab_result: FileText,
  prescription: Pill,
  appointment: CalendarCheck,
  invoice: Receipt,
};

// Module-level so two mounted instances (mobile topbar + desktop sidebar)
// don't both fire the welcome toast.
let TOAST_FIRED = false;

function timeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  const diff = Date.now() - t;
  const m = Math.round(diff / 60000);
  if (m < 1) return "agora";
  if (m < 60) return `há ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `há ${h}h`;
  const d = Math.round(h / 24);
  if (d < 7) return `há ${d}d`;
  return new Date(iso).toLocaleDateString("pt-PT", {
    day: "numeric",
    month: "short",
  });
}

export default function NotificationsBell() {
  const router = useRouter();
  const [items, setItems] = useState<Notification[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);

  // Initial fetch + welcome toast on first session mount when there are
  // unread items. RLS scopes the query to the current user.
  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    void supabase
      .from("notifications")
      .select("id, type, title, body, link, read_at, created_at")
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (cancelled) return;
        const list = (data as Notification[] | null) ?? [];
        setItems(list);
        setLoaded(true);

        if (!TOAST_FIRED) {
          TOAST_FIRED = true;
          const unread = list.filter((n) => !n.read_at).length;
          if (unread > 0) {
            toast.info(
              unread === 1
                ? "Tem 1 notificação nova"
                : `Tem ${unread} notificações novas`,
              { description: "Veja o sino no topo da página." }
            );
          }
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const unreadCount = useMemo(
    () => items.filter((n) => !n.read_at).length,
    [items]
  );

  const handleItemClick = (n: Notification) => {
    setOpen(false);
    if (!n.read_at) {
      const now = new Date().toISOString();
      setItems((curr) =>
        curr.map((x) => (x.id === n.id ? { ...x, read_at: now } : x))
      );
      void markNotificationsReadAction([n.id]);
    }
    if (n.link) router.push(n.link);
  };

  const handleMarkAll = () => {
    if (unreadCount === 0) return;
    const now = new Date().toISOString();
    setItems((curr) =>
      curr.map((x) => (x.read_at ? x : { ...x, read_at: now }))
    );
    void markAllNotificationsReadAction();
  };

  return (
    <div className="relative" ref={popRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={
          unreadCount > 0
            ? `${unreadCount} notificações novas`
            : "Notificações"
        }
        aria-expanded={open}
        aria-haspopup="true"
        className="relative grid size-9 place-items-center rounded-lg text-muted-foreground transition-[background-color,color,transform] duration-150 ease-out hover:bg-accent hover:text-foreground active:scale-95"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span
            aria-hidden
            className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-card"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notificações"
          className="absolute right-[-2.75rem] top-full z-50 mt-2 w-[min(20rem,calc(100vw-1.5rem))] origin-top-right overflow-hidden rounded-xl border border-border bg-card shadow-xl md:right-0"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-semibold text-foreground">
              Notificações
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/10"
              >
                <CheckCheck className="size-3" />
                Marcar todas
              </button>
            )}
          </div>

          {!loaded ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              A carregar…
            </div>
          ) : items.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <Bell className="mx-auto size-6 text-muted-foreground/40" />
              <p className="mt-3 text-sm font-medium text-foreground">
                Sem notificações
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Os avisos aparecem aqui quando há novidades.
              </p>
            </div>
          ) : (
            <ul className="max-h-96 divide-y divide-border overflow-y-auto">
              {items.map((n) => {
                const Icon = TYPE_ICON[n.type] ?? Bell;
                const isUnread = !n.read_at;
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => handleItemClick(n)}
                      className={
                        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent " +
                        (isUnread ? "bg-primary/5" : "")
                      }
                    >
                      <span
                        className={
                          "mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg " +
                          (isUnread
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground")
                        }
                      >
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span
                            className={
                              "truncate text-sm " +
                              (isUnread
                                ? "font-semibold text-foreground"
                                : "font-medium text-foreground/80")
                            }
                          >
                            {n.title}
                          </span>
                          <span className="shrink-0 text-[10px] text-muted-foreground">
                            {timeAgo(n.created_at)}
                          </span>
                        </div>
                        {n.body && (
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {n.body}
                          </p>
                        )}
                      </div>
                      {isUnread && (
                        <span
                          aria-hidden
                          className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
