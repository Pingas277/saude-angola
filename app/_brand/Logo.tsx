import Link from "next/link";

type LogoProps = {
  href?: string;
  /** "auto" follows the active theme; "light" is an alias of "auto" kept for
   *  back-compat; "dark" forces light text (for fixed dark surfaces). */
  variant?: "auto" | "light" | "dark";
  size?: "sm" | "md" | "lg";
  subtitle?: string;
  subtitleColor?: string;
};

const SIZES = {
  sm: { square: 26, text: "text-sm", subtitleSize: "text-[10px]" },
  md: { square: 30, text: "text-[15px]", subtitleSize: "text-[10px]" },
  lg: { square: 38, text: "text-lg", subtitleSize: "text-xs" },
} as const;

export default function Logo({
  href = "/",
  variant = "auto",
  size = "md",
  subtitle,
  subtitleColor,
}: LogoProps) {
  const s = SIZES[size];
  const textColor = variant === "dark" ? "text-white" : "text-foreground";
  const subColor =
    subtitleColor ??
    (variant === "dark" ? "text-emerald-300" : "text-muted-foreground");

  const Inner = (
    <div className="flex items-center gap-2.5">
      <span
        className="grid shrink-0 place-items-center rounded-md bg-primary font-semibold text-primary-foreground"
        style={{ width: s.square, height: s.square, fontSize: s.square / 1.9 }}
      >
        S
      </span>
      <div className="flex flex-col leading-none">
        <span className={`font-semibold tracking-tight ${textColor} ${s.text}`}>
          Saúde Angola
        </span>
        {subtitle && (
          <span
            className={`mt-1 font-medium uppercase tracking-[0.14em] ${s.subtitleSize} ${subColor}`}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="inline-flex items-center">
      {Inner}
    </Link>
  ) : (
    Inner
  );
}
