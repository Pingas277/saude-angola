import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Bell,
  CalendarCheck,
  CheckCheck,
  FileText,
  Pill,
  Receipt,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { markAllNotificationsReadAction } from "../../_app/notifications-actions";

// Wrap the action in a (formData) → void shape that <form action={...}>
// expects. The underlying action returns { ok: boolean } which we discard
// — the page revalidates via the action's own revalidatePath.
async function markAllForm(_: FormData) {
  "use server";
  await markAllNotificationsReadAction();
}

export const metadata = { title: "Avisos · Lunga" };

type NotifRow = {
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

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
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

export default async function NotificacoesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: rows } = await supabase
    .from("notifications")
    .select("id, type, title, body, link, read_at, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  const list = (rows as NotifRow[] | null) ?? [];
  const unreadCount = list.filter((n) => !n.read_at).length;

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="flex items-end justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            A sua atividade
          </div>
          <h1 className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            <Bell className="size-6 text-primary" />
            Avisos
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Receitas, exames, faturas e consultas — tudo o que aconteceu
            consigo, em ordem.
          </p>
        </div>
        {unreadCount > 0 && (
          <form action={markAllForm}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-accent"
            >
              <CheckCheck className="size-3.5" />
              Marcar todas
            </button>
          </form>
        )}
      </header>

      <section className="mt-8">
        {list.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
              <Bell className="size-6" />
            </span>
            <h2 className="mt-5 text-base font-semibold text-foreground">
              Sem avisos
            </h2>
            <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
              Quando houver uma novidade — receita pronta, exame
              carregado, consulta marcada — aparece aqui.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {list.map((n) => {
              const Icon = TYPE_ICON[n.type] ?? Bell;
              const isUnread = !n.read_at;
              return (
                <li key={n.id}>
                  <Link
                    href={n.link ?? "#"}
                    className={
                      "flex w-full items-start gap-3 px-4 py-3.5 transition-colors hover:bg-accent " +
                      (isUnread ? "bg-primary/5" : "")
                    }
                  >
                    <span
                      className={
                        "mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg " +
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
                        <p className="mt-0.5 text-xs text-muted-foreground">
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
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
