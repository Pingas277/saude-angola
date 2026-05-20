import {
  BatteryFull,
  Bell,
  Calendar,
  ChevronRight,
  CreditCard,
  FileText,
  Home,
  Pill,
  Signal,
  User,
  Video,
  Wifi,
} from "lucide-react";

/**
 * Phone mockup showing the Lunga patient app — used on the landing
 * hero. Pure-CSS phone frame (no images), bright app screen inside.
 * Tall on desktop, scales down on mobile if ever exposed there.
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

      {/* Floating chip — "TUDO no telemóvel" callout */}
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

      {/* App content */}
      <div className="flex-1 overflow-hidden px-4 pt-7">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[9px] font-medium uppercase tracking-wider text-slate-500">
              Bom dia
            </div>
            <div className="text-[15px] font-semibold tracking-tight text-slate-900">
              Maria F.
            </div>
          </div>
          <div className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 text-[10px] font-bold text-white shadow-sm">
            MF
          </div>
        </div>

        {/* Next appointment hero card */}
        <div className="relative mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 via-sky-600 to-emerald-600 p-3.5 text-white shadow-md shadow-sky-500/30">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-6 -top-6 size-20 rounded-full bg-white/20 blur-2xl"
          />
          <div className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/85">
            Próxima consulta · Hoje 14:30
          </div>
          <div className="mt-1.5 text-[13px] font-semibold leading-tight">
            Dra. Helena Mendes
          </div>
          <div className="mt-0.5 text-[10px] text-white/80">
            Cardiologia · Vídeo
          </div>
          <button className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-[10px] font-bold text-sky-700">
            <Video className="size-3" />
            Entrar na consulta
          </button>
        </div>

        {/* Quick actions */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          {[
            {
              icon: Calendar,
              label: "Marcar",
              color: "from-sky-500 to-blue-600",
            },
            {
              icon: Video,
              label: "Vídeo",
              color: "from-emerald-500 to-teal-600",
            },
            {
              icon: Pill,
              label: "Receitas",
              color: "from-rose-500 to-pink-600",
            },
            {
              icon: CreditCard,
              label: "Faturas",
              color: "from-amber-500 to-orange-600",
            },
          ].map((a) => (
            <div key={a.label} className="flex flex-col items-center gap-1">
              <div
                className={`grid size-9 place-items-center rounded-xl bg-gradient-to-br ${a.color} text-white shadow-sm`}
              >
                <a.icon className="size-[15px]" />
              </div>
              <div className="text-[8px] font-medium text-slate-700">
                {a.label}
              </div>
            </div>
          ))}
        </div>

        {/* Mini passaporte */}
        <div className="relative mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-sky-950 to-emerald-950 p-3 text-white shadow-md">
          <div className="text-[7px] font-bold uppercase tracking-[0.22em] text-amber-100/80">
            Passaporte de Saúde
          </div>
          <div className="mt-1.5 flex items-end justify-between">
            <div>
              <div className="font-mono text-[10px] font-bold uppercase tracking-wide">
                Maria F.
              </div>
              <div className="mt-0.5 text-[8px] text-white/55">
                Tipo sang. <strong className="text-white">O+</strong> · 21
                anos
              </div>
            </div>
            <div className="rounded-md bg-white px-1.5 py-0.5 font-mono text-[7px] font-black uppercase tracking-wider text-slate-900">
              lunga
            </div>
          </div>
        </div>

        {/* Activity peek */}
        <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
              <FileText className="size-3.5" />
            </span>
            <div className="leading-tight">
              <div className="text-[10px] font-semibold text-slate-800">
                Receita pronta
              </div>
              <div className="text-[8px] text-slate-500">
                Pague na farmácia com QR
              </div>
            </div>
          </div>
          <ChevronRight className="size-3 text-slate-400" />
        </div>
      </div>

      {/* Bottom nav */}
      <div className="mt-1 flex items-center justify-around border-t border-slate-200 bg-white px-4 py-2 pb-3">
        <NavIcon icon={Home} active />
        <NavIcon icon={Calendar} />
        <NavIcon icon={FileText} />
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
