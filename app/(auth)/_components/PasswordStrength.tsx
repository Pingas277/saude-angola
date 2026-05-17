"use client";

export function scorePassword(pw: string): number {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const META = [
  { label: "", bar: "bg-transparent", text: "text-muted-foreground" },
  { label: "Fraca", bar: "bg-destructive", text: "text-destructive" },
  { label: "Razoável", bar: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
  { label: "Boa", bar: "bg-primary/70", text: "text-primary" },
  { label: "Forte", bar: "bg-primary", text: "text-primary" },
];

export default function PasswordStrength({ value }: { value: string }) {
  const score = scorePassword(value);
  if (!value) return null;
  const meta = META[score];

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={
              "h-1 flex-1 rounded-full transition-colors " +
              (i <= score ? meta.bar : "bg-border")
            }
          />
        ))}
      </div>
      {meta.label && (
        <p className={"text-xs font-medium " + meta.text}>
          Segurança: {meta.label}
        </p>
      )}
    </div>
  );
}
