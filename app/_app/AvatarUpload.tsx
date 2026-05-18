"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Trash2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { setAvatarUrl } from "./avatar";

const MAX_BYTES = 3 * 1024 * 1024; // 3 MB

function initials(name: string): string {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (!p.length) return "—";
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

export default function AvatarUpload({
  userId,
  name,
  initialUrl,
}: {
  userId: string;
  name: string;
  initialUrl: string | null;
}) {
  const supabase = createClient();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | null>(initialUrl);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pending, startTransition] = useTransition();

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Escolha um ficheiro de imagem.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("A imagem é demasiado grande (máx. 3 MB).");
      return;
    }

    setBusy(true);
    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${userId}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(path);
      const busted = `${publicUrl}?t=${Date.now()}`;

      const res = await setAvatarUrl(busted);
      if (res?.error) throw new Error(res.error);

      setUrl(busted);
      startTransition(() => router.refresh());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível enviar a foto."
      );
    } finally {
      setBusy(false);
    }
  }

  async function onRemove() {
    setBusy(true);
    setError(null);
    try {
      const res = await setAvatarUrl(null);
      if (res?.error) throw new Error(res.error);
      setUrl(null);
      startTransition(() => router.refresh());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível remover."
      );
    } finally {
      setBusy(false);
    }
  }

  const working = busy || pending;

  return (
    <div className="flex items-center gap-5">
      <div className="relative">
        <span className="grid size-20 place-items-center overflow-hidden rounded-full border border-border bg-primary/10 text-xl font-semibold text-primary">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt="Foto de perfil"
              className="size-full object-cover"
            />
          ) : (
            initials(name)
          )}
        </span>
        {working && (
          <span className="absolute inset-0 grid place-items-center rounded-full bg-background/60">
            <Loader2 className="size-5 animate-spin text-primary" />
          </span>
        )}
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={working}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            <Camera className="size-4" />
            {url ? "Alterar foto" : "Adicionar foto"}
          </button>
          {url && (
            <button
              type="button"
              disabled={working}
              onClick={onRemove}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-destructive disabled:opacity-60"
            >
              <Trash2 className="size-4" />
              Remover
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          JPG ou PNG, até 3 MB. A foto aparece no menu lateral.
        </p>
        {error && (
          <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-destructive">
            <AlertCircle className="size-3.5" />
            {error}
          </p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPick}
        />
      </div>
    </div>
  );
}
