import Link from "next/link";

type LogoProps = {
  href?: string;
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  subtitle?: string;
  subtitleColor?: string;
};

const SIZES = {
  sm: { square: 28, text: "text-sm", subtitleSize: "text-[10px]" },
  md: { square: 32, text: "text-base", subtitleSize: "text-[11px]" },
  lg: { square: 40, text: "text-lg", subtitleSize: "text-xs" },
} as const;

export default function Logo({
  href = "/",
  variant = "light",
  size = "md",
  subtitle,
  subtitleColor,
}: LogoProps) {
  const s = SIZES[size];
  const textColor = variant === "light" ? "text-slate-900" : "text-white";
  const subColor =
    subtitleColor ??
    (variant === "light" ? "text-emerald-700" : "text-emerald-200");

  const Inner = (
    <div className="flex items-center gap-2">
      <span
        className="grid shrink-0 place-items-center rounded-md bg-emerald-600 font-bold text-white shadow-sm ring-1 ring-emerald-700/30"
        style={{ width: s.square, height: s.square, fontSize: s.square / 1.7 }}
      >
        S
      </span>
      <div className="flex flex-col leading-tight">
        <span className={`font-bold tracking-tight ${textColor} ${s.text}`}>
          Saúde Angola
        </span>
        {subtitle && (
          <span
            className={`uppercase tracking-wider ${s.subtitleSize} ${subColor}`}
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
