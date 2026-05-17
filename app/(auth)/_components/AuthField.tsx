"use client";

import { useState, type ComponentProps } from "react";
import type { LucideIcon } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";

type AuthFieldProps = {
  id: string;
  name: string;
  label: string;
  icon: LucideIcon;
  type?: "text" | "email" | "tel" | "password";
  optional?: boolean;
  hint?: string;
} & Omit<ComponentProps<"input">, "id" | "name" | "type">;

export default function AuthField({
  id,
  name,
  label,
  icon: Icon,
  type = "text",
  optional = false,
  hint,
  className,
  ...inputProps
}: AuthFieldProps) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword ? (show ? "text" : "password") : type;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="flex items-center justify-between text-sm font-medium text-foreground"
      >
        <span>{label}</span>
        {optional && (
          <span className="text-xs font-normal text-muted-foreground">
            opcional
          </span>
        )}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          id={id}
          name={name}
          type={resolvedType}
          className={
            "h-11 w-full rounded-lg border border-input bg-background pl-9 pr-10 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 " +
            (className ?? "")
          }
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
