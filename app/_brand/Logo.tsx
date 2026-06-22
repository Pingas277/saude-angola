import Link from "next/link";
import Image from "next/image";

type LogoProps = {
  href?: string;
  /** "auto" follows the active theme (default). "light" is an alias of
   *  "auto" kept for back-compat. "dark" forces light subtitle color (for
   *  fixed dark surfaces). The lockup image itself is transparent and
   *  reads on any background. */
  variant?: "auto" | "light" | "dark";
  size?: "sm" | "md" | "lg";
  /** Optional small line under the lockup (role label or tagline). */
  subtitle?: string;
  subtitleColor?: string;
  /** No-op: kept for back-compat with old callsites that passed it. */
  markOnly?: boolean;
};

const RATIO = 1; // new lockup PNG is square 2000×2000
// Heights chosen so the visible logo matches the old 2:1 SVG lockup at the
// same call-sites — old width (h × 2) becomes the new square edge length.
const SIZES = {
  sm: { h: 40, subSize: "text-[9px]" },
  md: { h: 56, subSize: "text-[10px]" },
  lg: { h: 96, subSize: "text-[11px]" },
} as const;

export default function Logo({
  href = "/",
  variant = "auto",
  size = "md",
  subtitle,
  subtitleColor,
}: LogoProps) {
  const s = SIZES[size];
  const h = s.h;
  const w = Math.round(h * RATIO);
  const subColor =
    subtitleColor ??
    (variant === "dark" ? "text-white/75" : "text-muted-foreground");

  const Inner = (
    <div className="flex flex-col items-start leading-none">
      <Image
        src="/brand/logo-full.png"
        alt="lunga"
        width={w}
        height={h}
        priority
        className="shrink-0 object-contain"
        style={{ height: h, width: w }}
      />
      {subtitle && (
        <span
          className={`mt-1.5 font-medium uppercase tracking-[0.18em] ${s.subSize} ${subColor}`}
        >
          {subtitle}
        </span>
      )}
    </div>
  );

  return href ? (
    <Link href={href} className="inline-flex items-center" aria-label="lunga">
      {Inner}
    </Link>
  ) : (
    Inner
  );
}
