"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { changeStaffRoleAction, removeStaffAction } from "./actions";
import { ROLE_LABELS } from "@/lib/labels";

const ROLE_OPTIONS: Array<keyof typeof ROLE_LABELS> = [
  "doctor",
  "nurse",
  "receptionist",
  "admin",
];

export default function StaffRowActions({
  targetId,
  currentRole,
}: {
  targetId: string;
  currentRole: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <select
        defaultValue={currentRole}
        disabled={isPending}
        onChange={(e) => {
          const role = e.target.value;
          if (role === currentRole) return;
          const fd = new FormData();
          fd.set("target_id", targetId);
          fd.set("role", role);
          startTransition(async () => {
            await changeStaffRoleAction(fd);
            router.refresh();
          });
        }}
        className="rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground disabled:opacity-60"
      >
        {ROLE_OPTIONS.map((r) => (
          <option key={r} value={r}>
            {ROLE_LABELS[r]}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (!confirm("Remover este membro da equipa?")) return;
          const fd = new FormData();
          fd.set("target_id", targetId);
          startTransition(async () => {
            await removeStaffAction(fd);
            router.refresh();
          });
        }}
        className="rounded-md border border-destructive/30 bg-card px-3 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-60"
      >
        Remover
      </button>
    </div>
  );
}
