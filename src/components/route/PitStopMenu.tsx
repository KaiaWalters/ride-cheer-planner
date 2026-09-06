import { Footprints, MapPin, Navigation, Route as RouteIcon, X } from "lucide-react";
import { PIT_STOP_COLOR, PIT_STOP_LABEL, type PitStop } from "@/lib/route-plan-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function PitStopMenu({ pit, onClose }: { pit: PitStop; onClose: () => void }) {
  return (
    <div className="p-4">
      <div className="flex items-start gap-3">
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
          style={{ backgroundColor: PIT_STOP_COLOR[pit.kind] }}
        >
          <MapPin className="h-4 w-4 text-card" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-bold">{pit.name}</h2>
          <Badge variant="secondary" className="mt-1 text-[10px]">
            {PIT_STOP_LABEL[pit.kind]}
          </Badge>
        </div>
        <Button size="icon" variant="ghost" onClick={onClose} aria-label="Close">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-3 space-y-2 text-sm">
        <p className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          {pit.address}
        </p>
        <p className="flex items-start gap-2">
          <Footprints className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <span>
            {pit.offRouteMi} mi off route
            <span className="block text-xs text-muted-foreground">~ {pit.minutesAway} min detour</span>
          </span>
        </p>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Pit stops are optional and are not part of the planned route.
      </p>

      <div className="mt-4 space-y-2">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors duration-200 hover:bg-secondary/60"
        >
          <RouteIcon className="h-4 w-4 text-primary" />
          <span>
            <span className="block text-sm font-medium">Add as a trip location</span>
            <span className="block text-xs text-muted-foreground">Include in your planned route</span>
          </span>
        </button>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors duration-200 hover:bg-secondary/60"
        >
          <MapPin className="h-4 w-4 text-accent" />
          <span>
            <span className="block text-sm font-medium">Add as a pit stop</span>
            <span className="block text-xs text-muted-foreground">Mark as an optional stop</span>
          </span>
        </button>
        <Button variant="secondary" className="h-11 w-full">
          <Navigation className="h-4 w-4" /> Directions
        </Button>
      </div>
    </div>
  );
}
