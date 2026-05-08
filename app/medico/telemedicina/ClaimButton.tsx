"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { claimConsultationAction } from "./actions";

export function ClaimButton({ consultationId }: { consultationId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const r = await claimConsultationAction(consultationId);
          if (r?.ok) router.push(`/medico/telemedicina/sala/${consultationId}`);
          else if (r?.error) alert(r.error);
        })
      }
      className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? "A atender…" : "Atender →"}
    </button>
  );
}
