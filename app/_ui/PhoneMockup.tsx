import {
  BatteryFull,
  Bell,
  CalendarPlus,
  CalendarCheck,
  ChevronRight,
  FileText,
  FlaskConical,
  Home,
  Pill,
  Receipt,
  Signal,
  Stethoscope,
  User,
  Video,
  Wifi,
} from "lucide-react";

/**
 * Phone mockup shown in the landing hero. Mirrors the real /painel
 * patient dashboard 1:1 — same eyebrow + heading + Marcar CTA, same
 * Próxima consulta card, same Health-Passport gradient + Lunga gold
 * accent, same notif peek, same bottom nav. Keeps the floating "App
 * do paciente" + "Falou em 3 min com Dra. Helena" chips outside the
 * frame for context.
 */
export default function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[280px] sm:w-[300px]">
      {/* Soft glow behind the phone */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-10 -z-10 rounded-[5rem] bg-gradient-to-br from-sky-400/30 via-emerald-300/20 to-transparent blur-3xl"
      />

      {/* Phone frame */}
      <div className="relative aspect-[9/19] rounded-[3rem] bg-gradient-to-b from-slate-900 to-black p-[10px] shadow-[0_40px_80px_-20px_rgba(2,32,48,0.6),0_15px_30px_-10px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
        {/* Side buttons */}
        <span className="absolute -left-[2px] top-24 h-7 w-[3px] rounded-l-sm bg-slate-700" />
        <span className="absolute -left-[2px] top-[8.5rem] h-12 w-[3px] rounded-l-sm bg-slate-700" />
        <span className="absolute -left-[2px] top-[12.5rem] h-12 w-[3px] rounded-l-sm bg-slate-700" />
        <span className="absolute -right-[2px] top-32 h-16 w-[3px] rounded-r-sm bg-slate-700" />

        {/* Screen */}
        <div className="relative size-full overflow-hidden rounded-[2.3rem] bg-slate-50">
          {/* Dynamic island */}
          <div className="absolute left-1/2 top-2.5 z-20 h-[22px] w-[90px] -translate-x-1/2 rounded-full bg-black" />

          <PhoneAppContent />
        </div>
      </div>

      {/* Floating chip — "App do paciente" callout */}
      <div className="absolute -right-6 top-16 hidden rotate-[6deg] rounded-xl border border-white/15 bg-black/55 px-3 py-2 text-[10px] font-medium text-white shadow-xl backdrop-blur md:block">
        <div className="font-mono uppercase tracking-[0.18em] text-amber-200/90">
          App do paciente
        </div>
        <div className="mt-0.5 text-white/85">Grátis, em qualquer telemóvel</div>
      </div>

      {/* Floating chip — bottom left */}
      <div className="absolute -bottom-4 -left-8 hidden -rotate-[5deg] items-center gap-2 rounded-xl border border-white/15 bg-white/95 px-3 py-2 text-[11px] font-semibold text-slate-900 shadow-xl md:flex">
        <span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-sky-500 to-emerald-500 text-white">
          <Video className="size-3.5" />
        </span>
        <div className="leading-tight">
          <div>Falou em 3 min</div>
          <div className="text-[9px] font-normal text-slate-500">
            com Dra. Helena
          </div>
        </div>
      </div>
    </div>
  );
}

function PhoneAppContent() {
  return (
    <div className="flex h-full flex-col">
      {/* Status bar */}
      <div className="flex items-center justify-between px-6 pt-2 text-[10px] font-semibold text-slate-900">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <Signal className="size-3" />
          <Wifi className="size-3" />
          <BatteryFull className="size-[14px]" />
        </div>
      </div>

      {/* App content — mirrors /painel structure */}
      <div className="flex-1 overflow-hidden px-4 pt-6">
        {/* Header — same eyebrow + h1 + date as /painel */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[8px] font-bold uppercase tracking-[0.18em] text-sky-600">
              Bom dia, Maria
            </div>
            <div className="mt-1 text-[14px] font-semibold leading-tight tracking-tight text-slate-900">
              O seu painel de saúde
            </div>
            <div className="mt-0.5 text-[8px] text-slate-500">
              quinta-feira, 25 de junho
            </div>
          </div>
          {/* 'Marcar consulta' CTA — primary button just like /painel */}
          <button className="inline-flex shrink-0 items-center gap-1 rounded-md bg-sky-600 px-2 py-1.5 text-[8px] font-bold text-white shadow-sm">
            <CalendarPlus className="size-2.5" />
            Marcar
          </button>
        </div>

        {/* Mini Health Passport — exact same gradient + lunga gold accent
            as the real /painel HealthPassport */}
        <div className="relative mt-3 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-sky-950 to-emerald-950 p-2.5 text-white shadow-md">
          {/* dotted overlay (mimics the real passport surface) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)",
              backgroundSize: "8px 8px",
            }}
          />
          <div className="relative">
            <div className="flex items-center justify-between text-[6.5px] font-bold uppercase tracking-[0.22em] text-amber-100/85">
              <span>Passaporte de Saúde</span>
              <span>· AO ·</span>
            </div>
            <div className="mt-1.5 flex items-end justify-between">
              <div>
                <div className="font-mono text-[10px] font-bold uppercase tracking-wide">
                  Maria Fonseca
                </div>
                <div className="mt-0.5 text-[7.5px] text-white/55">
                  Tipo sang. <strong className="text-white">O+</strong> · 21
                  anos
                </div>
                <div className="mt-1 text-[6.5px] text-white/45">
                  ID · LG-7K4-2901
                </div>
              </div>
              <div className="rounded-sm bg-white px-1.5 py-0.5 font-mono text-[7px] font-black uppercase tracking-wider text-slate-900">
                lunga
              </div>
            </div>
          </div>
        </div>

        {/* Próxima consulta — same blue→emerald gradient card as /painel */}
        <div className="relative mt-3 overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 via-sky-600 to-emerald-600 p-2.5 text-white shadow-md shadow-sky-500/30">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-6 -top-6 size-20 rounded-full bg-white/20 blur-2xl"
          />
          <div className="relative flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[6.5px] font-bold uppercase tracking-[0.18em] text-white/85">
                Próxima consulta · Hoje 14:30
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-white/20">
                  <Stethoscope className="size-2.5" />
                </span>
                <div className="text-[11px] font-semibold leading-tight">
                  Dra. Helena Mendes
                </div>
              </div>
              <div className="mt-0.5 pl-6 text-[8px] text-white/80">
                Cardiologia · Vídeo
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-white/95 px-1.5 py-0.5 text-[6.5px] font-bold text-sky-700">
              Marcada
            </span>
          </div>
          <button className="relative mt-2 inline-flex w-full items-center justify-center gap-1 rounded-md bg-white/95 px-2 py-1 text-[8.5px] font-bold text-sky-700">
            <Video className="size-2.5" />
            Entrar na consulta
          </button>
        </div>

        {/* Quick actions — atalhos para Receitas / Exames / Faturas /
            Notificações. Match the 4-icon row the user liked. */}
        <div className="mt-3 grid grid-cols-4 gap-1.5">
          {[
            {
              icon: Pill,
              label: "Receitas",
              color: "from-rose-500 to-pink-600",
            },
            {
              icon: FlaskConical,
              label: "Exames",
              color: "from-cyan-500 to-sky-600",
            },
            {
              icon: Receipt,
              label: "Faturas",
              color: "from-amber-500 to-orange-600",
            },
            {
              icon: CalendarCheck,
              label: "Consultas",
              color: "from-emerald-500 to-teal-600",
            },
          ].map((a) => (
            <div key={a.label} className="flex flex-col items-center gap-1">
              <div
                className={`grid size-8 place-items-center rounded-xl bg-gradient-to-br ${a.color} text-white shadow-sm`}
              >
                <a.icon className="size-3.5" />
              </div>
              <div className="text-[7px] font-medium text-slate-700">
                {a.label}
              </div>
            </div>
          ))}
        </div>

        {/* Notif peek — same row style as the real notifications dropdown */}
        <div className="mt-2.5 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-2 py-1.5">
          <div className="flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
              <FileText className="size-3" />
            </span>
            <div className="leading-tight">
              <div className="text-[9px] font-semibold text-slate-800">
                Receita pronta
              </div>
              <div className="text-[7px] text-slate-500">
                Mostre o QR na farmácia · há 2 min
              </div>
            </div>
          </div>
          <span className="size-1.5 rounded-full bg-sky-500" />
        </div>
      </div>

      {/* Bottom nav — what mobile patient nav will look like once we
          add a tab bar (item I on roadmap). Five items, active is sky. */}
      <div className="mt-1 flex items-center justify-around border-t border-slate-200 bg-white px-4 py-2 pb-3">
        <NavIcon icon={Home} active />
        <NavIcon icon={CalendarCheck} />
        <NavIcon icon={Pill} />
        <NavIcon icon={Bell} />
        <NavIcon icon={User} />
      </div>
    </div>
  );
}

function NavIcon({
  icon: Icon,
  active,
}: {
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
}) {
  return (
    <div
      className={`relative grid size-7 place-items-center ${
        active ? "text-sky-600" : "text-slate-400"
      }`}
    >
      <Icon className="size-[15px]" />
      {active && (
        <span className="absolute -bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-sky-600" />
      )}
    </div>
  );
}
