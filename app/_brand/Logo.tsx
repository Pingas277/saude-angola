import Link from "next/link";
import Image from "next/image";

type LogoProps = {
  href?: string;
  /** "auto" follows the active theme; "light" is an alias of "auto" kept for
   *  back-compat; "dark" forces light text (for fixed dark surfaces). */
  variant?: "auto" | "light" | "dark";
  size?: "sm" | "md" | "lg";
  /** Overrides the default brand tagline ("Saúde para todos"). Role shells
   *  pass their own label here (e.g. "Médico"). */
  subtitle?: string;
  subtitleColor?: string;
  /** Hide the wordmark, show only the pulse mark (collapsed contexts). */
  markOnly?: boolean;
};

const SIZES = {
  sm: { mark: 22, text: "text-sm", sub: "text-[9px]" },
  md: { mark: 26, text: "text-[15px]", sub: "text-[10px]" },
  lg: { mark: 34, text: "text-lg", sub: "text-[11px]" },
} as const;

const MARK_RATIO = 506 / 335; // intrinsic logo-mark.png aspect

export default function Logo({
  href = "/",
  variant = "auto",
  size = "md",
  subtitle = "Saúde para todos",
  subtitleColor,
  markOnly = false,
}: LogoProps) {
  const s = SIZES[size];
  const h = s.mark;
  const w = Math.round(h * MARK_RATIO);
  const textColor = variant === "dark" ? "text-white" : "text-foreground";
  const subColor =
    subtitleColor ??
    (variant === "dark" ? "text-white/70" : "text-muted-foreground");

  const Inner = (
    <div className="flex items-center gap-2.5">
      <Image
        src="/brand/logo-mark.png"
        alt="ANGOLASAUDE"
        width={w}
        height={h}
        priority
        className="shrink-0 object-contain"
        style={{ height: h, width: w }}
      />
      {!markOnly && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-bold tracking-[0.06em] ${textColor} ${s.text}`}
          >
            ANGOLASAUDE
          </span>
          {subtitle && (
            <span
              className={`mt-1 font-medium uppercase tracking-[0.16em] ${s.sub} ${subColor}`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  return href ? (
    <Link href={href} className="inline-flex items-center" aria-label="ANGOLASAUDE">
      {Inner}
    </Link>
  ) : (
    Inner
  );
}
