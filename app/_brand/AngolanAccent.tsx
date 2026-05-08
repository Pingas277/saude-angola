// 6pt accent stripe at the very top of every page — the Angolan flag's
// horizontal split (red over black). Subtle but unmistakable.
export default function AngolanAccent() {
  return (
    <div aria-hidden className="flex h-1.5 w-full">
      <div className="h-full w-full" style={{ background: "#CD1126" }} />
    </div>
  );
}

// Two-stripe variant (red + black) for hero sections and brand panels.
export function AngolanFlagStripe({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`flex h-2 w-full overflow-hidden ${className}`}>
      <div style={{ background: "#CD1126" }} className="h-full flex-1" />
      <div style={{ background: "#000000" }} className="h-full flex-1" />
    </div>
  );
}
