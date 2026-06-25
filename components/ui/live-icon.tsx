"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type CSSProperties,
} from "react";
import { SearchIcon } from "./search";
import { FileTextIcon } from "./file-text";
import { CreditCardIcon } from "./credit-card";
import { CalendarCheckIcon } from "./calendar-check";
import { StethoscopeIcon } from "./stethoscope";
import { BellIcon } from "./bell";
import { UserIcon } from "./user";
import { ActivityIcon } from "./activity";
import { ReceiptIcon } from "./receipt";
import { HeartPulseIcon } from "./heart-pulse";
import { LayersIcon } from "./layers";
import { MapPinIcon } from "./map-pin";
import {
  Video,
  Pill,
  FlaskConical,
  Users,
  Sparkles,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

// Bridges the @lucide-animated registry icons (each its own client
// component with a {startAnimation, stopAnimation} ref handle) behind one
// string-keyed API so server components can pick an icon by name. Icons
// that don't exist in the animated registry fall back to a static Lucide
// glyph — so callers never have to care which is which.

export type LiveIconHandle = {
  startAnimation: () => void;
  stopAnimation: () => void;
};

type AnimatedIcon = React.ForwardRefExoticComponent<
  { size?: number; className?: string } & React.RefAttributes<LiveIconHandle>
>;

const ANIMATED: Record<string, AnimatedIcon> = {
  search: SearchIcon as unknown as AnimatedIcon,
  "file-text": FileTextIcon as unknown as AnimatedIcon,
  "credit-card": CreditCardIcon as unknown as AnimatedIcon,
  "calendar-check": CalendarCheckIcon as unknown as AnimatedIcon,
  stethoscope: StethoscopeIcon as unknown as AnimatedIcon,
  bell: BellIcon as unknown as AnimatedIcon,
  user: UserIcon as unknown as AnimatedIcon,
  activity: ActivityIcon as unknown as AnimatedIcon,
  receipt: ReceiptIcon as unknown as AnimatedIcon,
  "heart-pulse": HeartPulseIcon as unknown as AnimatedIcon,
  layers: LayersIcon as unknown as AnimatedIcon,
  "map-pin": MapPinIcon as unknown as AnimatedIcon,
};

const STATIC: Record<string, LucideIcon> = {
  video: Video,
  pill: Pill,
  "flask-conical": FlaskConical,
  users: Users,
  sparkles: Sparkles,
  "shield-check": ShieldCheck,
};

export const LiveIcon = forwardRef<
  LiveIconHandle,
  { name: string; size?: number; className?: string }
>(({ name, size = 24, className }, ref) => {
  const inner = useRef<LiveIconHandle>(null);
  useImperativeHandle(ref, () => ({
    startAnimation: () => inner.current?.startAnimation(),
    stopAnimation: () => inner.current?.stopAnimation(),
  }));

  const Animated = ANIMATED[name];
  if (Animated) {
    return <Animated ref={inner} size={size} className={className} />;
  }

  const Static = STATIC[name];
  if (!Static) return null;
  const style: CSSProperties = { width: size, height: size };
  return <Static className={className} style={style} strokeWidth={2} />;
});

LiveIcon.displayName = "LiveIcon";
