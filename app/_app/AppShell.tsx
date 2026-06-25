"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import Logo from "../_brand/Logo";
import { logoutAction } from "../(auth)/actions";
import { ROLE_NAV, type RoleKey, type NavItem } from "./nav";
import NotificationsBell from "./NotificationsBell";
import PatientBottomTabNav from "./PatientBottomTabNav";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function AppShell({
  role,
  userName,
  userMeta,
  avatarUrl,
  children,
}: {
  role: RoleKey;
  userName: string;
  userMeta?: string;
  avatarUrl?: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { items, roleLabel, homeHref } = ROLE_NAV[role];

  // Longest-prefix match wins, so nested routes highlight the right item.
  let activeHref = "";
  for (const it of items) {
    if (
      (pathname === it.href || pathname.startsWith(it.href + "/")) &&
      it.href.length > activeHref.length
    ) {
      activeHref = it.href;
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* === Desktop sidebar === */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-card md:flex">
        <div className="flex h-16 items-center justify-between gap-2 border-b border-border px-5">
          <Logo href={homeHref} size="md" subtitle={roleLabel} />
          <NotificationsBell />
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {items.map((it) => (
            <NavLink
              key={it.href}
              item={it}
              active={activeHref === it.href}
            />
          ))}
        </nav>
        <SidebarFooter userName={userName} userMeta={userMeta} avatarUrl={avatarUrl} />
      </aside>

      {/* === Content column === */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur md:hidden">
          <Logo href={homeHref} size="sm" subtitle={roleLabel} />
          <div className="flex items-center gap-2">
            <NotificationsBell />
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                aria-label="Abrir menu"
                className="inline-grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Menu className="size-4" />
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
                <div className="flex h-16 items-center border-b border-border px-5">
                  <Logo href={homeHref} size="md" subtitle={roleLabel} />
                </div>
                <nav className="space-y-0.5 p-3">
                  {items.map((it) => (
                    <NavLink
                      key={it.href}
                      item={it}
                      active={activeHref === it.href}
                      onNavigate={() => setMobileOpen(false)}
                    />
                  ))}
                </nav>
                <SidebarFooter userName={userName} userMeta={userMeta} avatarUrl={avatarUrl} />
              </SheetContent>
            </Sheet>
          </div>
        </header>

        <main className="flex-1 pb-20 md:pb-0">{children}</main>
      </div>

      {/* Mobile bottom tab nav — only for the patient role. The component
          itself is md:hidden so it doesn't conflict with the desktop
          sidebar. The pb-20 on main above clears the fixed bar's height
          so content isn't hidden underneath on mobile. */}
      {role === "patient" && <PatientBottomTabNav />}
    </div>
  );
}

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors " +
        (active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-foreground")
      }
    >
      <Icon className="size-4 shrink-0" />
      {item.label}
    </Link>
  );
}

function SidebarFooter({
  userName,
  userMeta,
  avatarUrl,
}: {
  userName: string;
  userMeta?: string;
  avatarUrl?: string | null;
}) {
  return (
    <div className="border-t border-border p-3">
      <div className="flex items-center gap-3 rounded-lg px-2 py-2">
        <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={userName}
              className="size-full object-cover"
            />
          ) : (
            initials(userName)
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-foreground">
            {userName}
          </div>
          {userMeta && (
            <div className="truncate text-xs text-muted-foreground">
              {userMeta}
            </div>
          )}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <form action={logoutAction} className="flex-1">
          <button
            type="submit"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Sair
          </button>
        </form>
      </div>
    </div>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "·";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
