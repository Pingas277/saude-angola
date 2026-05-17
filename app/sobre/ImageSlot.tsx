import Image from "next/image";
import { existsSync } from "node:fs";
import path from "node:path";
import type { ReactNode } from "react";

// Renders a real photo if the file exists under /public, otherwise a clean
// on-brand placeholder. Drop a file at the given path (e.g.
// public/sobre/clinica.jpg) and it appears automatically — no code change.
export default function ImageSlot({
  src,
  alt,
  caption,
  icon,
  className = "",
}: {
  src: string; // path relative to /public, e.g. "sobre/clinica.jpg"
  alt: string;
  caption: string;
  icon?: ReactNode;
  className?: string;
}) {
  let hasFile = false;
  try {
    hasFile = existsSync(path.join(process.cwd(), "public", src));
  } catch {
    hasFile = false;
  }

  return (
    <div
      className={
        "relative overflow-hidden rounded-2xl border border-border " +
        className
      }
    >
      {hasFile ? (
        <Image
          src={"/" + src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/5 to-background">
          {/* pulse-mark motif */}
          <Image
            src="/brand/logo-mark.png"
            alt=""
            width={160}
            height={106}
            aria-hidden
            className="pointer-events-none absolute -right-6 -bottom-4 opacity-15"
          />
          <div className="absolute inset-0 flex flex-col items-start justify-end gap-2 p-6">
            {icon && (
              <span className="grid size-10 place-items-center rounded-lg bg-background/70 text-primary backdrop-blur">
                {icon}
              </span>
            )}
            <span className="max-w-[80%] text-sm font-medium text-foreground/80">
              {caption}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
