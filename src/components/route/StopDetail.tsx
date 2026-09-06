import { Footprints, MapPin, X } from "lucide-react";
import {
  PIT_STOPS,
  PIT_STOP_COLOR,
  PIT_STOP_LABEL,
  TRIP_STOPS,
  type PitStop,
  type PitStopKind,
  type TripStop,
} from "@/lib/route-plan-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const KINDS: PitStopKind[] = ["pharmacy", "gas", "rest", "park"];

export function StopDetail({
  stop,
  onClose,
  onSelectPitStop,
}: {
  stop: TripStop;
  onClose: () => void;
  onSelectPitStop: (pit: PitStop) => void;
}) {
  const index = TRIP_STOPS.findIndex((s) => s.id === stop.id) + 1;

  return (
    <div className="flex max-h-full flex-col">
      <div className="flex items-start gap-3 p-4 pb-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          {index}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-bold">{stop.name}</h2>
          <p className="text-xs text-muted-foreground">Planned stop</p>
        </div>
        <Button size="icon" variant="ghost" onClick={onClose} aria-label="Close">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="min-h-0 space-y-4 overflow-y-auto px-4 pb-4">
        <div className="space-y-2 text-sm">
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            {stop.address}
          </p>
          <p className="flex items-start gap-2">
            <Footprints className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span>
              <span className="font-semibold">{stop.distanceMi} miles from start</span>
              <span className="block text-xs text-muted-foreground">~ {stop.durationLabel}</span>
            </span>
          </p>
        </div>

        <p className="text-sm text-muted-foreground">{stop.description}</p>

        <Button className="h-11 w-full">View details</Button>

        <div>
          <h3 className="text-sm font-semibold">Nearby pit stops (within 0.5 mi)</h3>
          <ul className="mt-2 space-y-2">
            {KINDS.map((kind) => {
              const list = PIT_STOPS.filter((p) => p.kind === kind);
              if (list.length === 0) return null;
              return list.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => onSelectPitStop(p)}
                    className="flex w-full items-center gap-3 rounded-xl border bg-card p-2.5 text-left transition-colors duration-200 hover:bg-secondary/60"
                  >
                    <span
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-full"
                      style={{ backgroundColor: PIT_STOP_COLOR[p.kind] }}
                    >
                      <MapPin className="h-3.5 w-3.5 text-card" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{p.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {p.offRouteMi} mi · {p.minutesAway} min
                      </span>
                    </span>
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      {PIT_STOP_LABEL[p.kind]}
                    </Badge>
                  </button>
                </li>
              ));
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
