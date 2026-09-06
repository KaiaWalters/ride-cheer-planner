import { Compass, Layers, Plus, Minus } from "lucide-react";
import {
  PIT_STOPS,
  PIT_STOP_COLOR,
  TRIP_STOPS,
  type PitStop,
  type TripStop,
} from "@/lib/route-plan-data";
import { cn } from "@/lib/utils";

function routePath(stops: TripStop[]) {
  return stops
    .map((s, i) => {
      if (i === 0) return `M ${s.x} ${s.y}`;
      const prev = stops[i - 1]!;
      const cx = (prev.x + s.x) / 2;
      return `C ${cx} ${prev.y}, ${cx} ${s.y}, ${s.x} ${s.y}`;
    })
    .join(" ");
}

export function StylizedMap({
  selectedStopId,
  selectedPitStopId,
  onSelectStop,
  onSelectPitStop,
  className,
}: {
  selectedStopId: string | null;
  selectedPitStopId: string | null;
  onSelectStop: (stop: TripStop) => void;
  onSelectPitStop: (pit: PitStop) => void;
  className?: string;
}) {
  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-muted", className)}>
      {/* terrain */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <rect width="100" height="100" fill="oklch(0.95 0.02 120)" />
        <path d="M0 8 C 25 2, 40 18, 62 12 S 92 22, 100 14 L100 0 L0 0Z" fill="oklch(0.9 0.05 150)" />
        <path
          d="M8 34 C 22 28, 30 42, 44 38 S 62 52, 78 44 L92 52 L100 46 L100 74 L0 70Z"
          fill="oklch(0.92 0.045 150)"
        />
        <path
          d="M0 52 C 14 46, 22 58, 34 55 S 52 64, 66 60 L66 66 C 50 70, 34 62, 20 66 S 4 62, 0 64Z"
          fill="oklch(0.86 0.06 235)"
        />
        <path
          d="M70 20 C 80 16, 88 24, 96 20 L100 26 L100 34 C 88 36, 78 30, 70 32Z"
          fill="oklch(0.86 0.06 235)"
        />
        <path d="M0 86 C 26 80, 48 92, 72 86 S 94 92, 100 88 L100 100 L0 100Z" fill="oklch(0.9 0.05 150)" />
        <g stroke="oklch(1 0 0)" strokeWidth="1.4" opacity="0.85" fill="none">
          <path d="M-2 22 L102 30" />
          <path d="M-2 62 L102 54" />
          <path d="M14 -2 L22 102" />
          <path d="M58 -2 L52 102" />
          <path d="M86 -2 L90 102" />
        </g>
        <g stroke="oklch(0.87 0.02 110)" strokeWidth="0.6" fill="none" opacity="0.9">
          <path d="M-2 42 L102 46" />
          <path d="M36 -2 L40 102" />
          <path d="M72 -2 L70 102" />
        </g>
      </svg>

      {/* route */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <path
          d={routePath(TRIP_STOPS)}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="0.9"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ strokeWidth: 4 }}
        />
      </svg>

      {/* place labels */}
      {[
        { t: "Oakview", x: 20, y: 36 },
        { t: "Mapleton", x: 26, y: 56 },
        { t: "Eastwood", x: 22, y: 88 },
        { t: "Lakeside", x: 80, y: 16 },
        { t: "Cedar Grove", x: 82, y: 70 },
      ].map((l) => (
        <span
          key={l.t}
          className="pointer-events-none absolute -translate-x-1/2 text-[11px] font-medium tracking-wide text-muted-foreground"
          style={{ left: `${l.x}%`, top: `${l.y}%` }}
        >
          {l.t}
        </span>
      ))}

      {/* pit stop pins */}
      {PIT_STOPS.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onSelectPitStop(p)}
          aria-label={`${p.name} pit stop`}
          className={cn(
            "absolute grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-card shadow-md transition-transform duration-200 hover:scale-110",
            selectedPitStopId === p.id && "scale-110 ring-2 ring-foreground/30",
          )}
          style={{ left: `${p.x}%`, top: `${p.y}%`, backgroundColor: PIT_STOP_COLOR[p.kind] }}
        >
          <span className="h-2 w-2 rounded-full bg-card" />
        </button>
      ))}

      {/* trip stop pins */}
      {TRIP_STOPS.map((s, i) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onSelectStop(s)}
          aria-label={s.name}
          className={cn(
            "absolute grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-card bg-primary text-sm font-bold text-primary-foreground shadow-lg transition-transform duration-200 hover:scale-110",
            selectedStopId === s.id && "scale-115 ring-4 ring-primary/25",
          )}
          style={{ left: `${s.x}%`, top: `${s.y}%` }}
        >
          {i + 1}
        </button>
      ))}

      {/* map controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <MapControl label="Recenter">
          <Compass className="h-4 w-4" />
        </MapControl>
        <MapControl label="Layers">
          <Layers className="h-4 w-4" />
        </MapControl>
      </div>
      <div className="absolute right-4 bottom-24 hidden flex-col gap-2 lg:flex">
        <MapControl label="Zoom in">
          <Plus className="h-4 w-4" />
        </MapControl>
        <MapControl label="Zoom out">
          <Minus className="h-4 w-4" />
        </MapControl>
      </div>

      <div className="absolute bottom-4 left-4 hidden items-center gap-2 rounded-lg bg-card/90 px-3 py-1.5 text-[11px] text-muted-foreground shadow-sm backdrop-blur lg:flex">
        <span className="h-1 w-14 rounded-full bg-foreground/70" /> 1 mile
      </div>
    </div>
  );
}

function MapControl({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="grid h-10 w-10 place-items-center rounded-full bg-card text-foreground shadow-md transition-colors hover:bg-secondary"
    >
      {children}
    </button>
  );
}
