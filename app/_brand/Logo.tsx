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

const RATIO = 913 / 464; // intrinsic aspect of the lunga lockup
const SIZES = {
  sm: { h: 22, subSize: "text-[9px]" },
  md: { h: 30, subSize: "text-[10px]" },
  lg: { h: 42, subSize: "text-[11px]" },
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
