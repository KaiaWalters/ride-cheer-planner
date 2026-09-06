import { useState } from "react";
import { ChevronDown, ChevronRight, MapPin, Plus, Save, Search } from "lucide-react";
import {
  PIT_STOPS,
  PIT_STOP_COLOR,
  PIT_STOP_LABEL,
  TRIP_STOPS,
  TRIP_SUMMARY,
  type PitStop,
  type TripStop,
} from "@/lib/route-plan-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export function StopsPanel({
  selectedStopId,
  onSelectStop,
  onSelectPitStop,
}: {
  selectedStopId: string | null;
  onSelectStop: (stop: TripStop) => void;
  onSelectPitStop: (pit: PitStop) => void;
}) {
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState("");

  const stops = TRIP_STOPS.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()));
  const pits = PIT_STOPS.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="space-y-3 px-4 pt-4 pb-3">
        <div>
          <h1 className="text-xl font-bold">{TRIP_SUMMARY.name}</h1>
          <p className="text-xs text-muted-foreground">{TRIP_SUMMARY.tagline}</p>
        </div>
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search locations or pit stops…"
            className="h-11 pl-9"
          />
        </div>
      </div>

      <Collapsible open={open} onOpenChange={setOpen} className="flex min-h-0 flex-1 flex-col">
        <CollapsibleTrigger className="flex items-center justify-between border-y px-4 py-2.5 text-left text-xs font-semibold tracking-wide uppercase transition-colors hover:bg-secondary/60">
          Stops on this trip
          <ChevronDown
            className={cn("h-4 w-4 transition-transform duration-200", !open && "-rotate-90")}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="min-h-0 flex-1 overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <Tabs defaultValue="locations" className="flex h-full min-h-0 flex-col">
            <TabsList className="mx-4 mt-3 grid w-auto grid-cols-2">
              <TabsTrigger value="locations">Trip locations ({TRIP_STOPS.length})</TabsTrigger>
              <TabsTrigger value="pits">Pit stops ({PIT_STOPS.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="locations" className="mt-3 min-h-0 flex-1 overflow-y-auto px-4 pb-4">
              <ul className="space-y-2">
                {stops.map((s) => {
                  const index = TRIP_STOPS.indexOf(s) + 1;
                  const active = selectedStopId === s.id;
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => onSelectStop(s)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-2xl border bg-card p-3 text-left transition-colors duration-200",
                          active ? "border-primary bg-primary/5" : "hover:bg-secondary/60",
                        )}
                      >
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                          {index}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold">{s.name}</span>
                          <span className="block text-xs text-muted-foreground">
                            {s.distanceMi} mi · {s.durationLabel}
                          </span>
                        </span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </TabsContent>

            <TabsContent value="pits" className="mt-3 min-h-0 flex-1 overflow-y-auto px-4 pb-4">
              <ul className="space-y-2">
                {pits.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => onSelectPitStop(p)}
                      className="flex w-full items-center gap-3 rounded-2xl border bg-card p-3 text-left transition-colors duration-200 hover:bg-secondary/60"
                    >
                      <span
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-full"
                        style={{ backgroundColor: PIT_STOP_COLOR[p.kind] }}
                      >
                        <MapPin className="h-4 w-4 text-card" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">{p.name}</span>
                        <span className="block text-xs text-muted-foreground">
                          {PIT_STOP_LABEL[p.kind]} · {p.offRouteMi} mi from route
                        </span>
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </button>
                  </li>
                ))}
              </ul>
            </TabsContent>
          </Tabs>
        </CollapsibleContent>
      </Collapsible>

      <div className="space-y-2 border-t p-4">
        <Button className="h-12 w-full">
          <Plus className="h-4 w-4" /> Add location
        </Button>
        <Button variant="secondary" className="h-12 w-full">
          <Save className="h-4 w-4" /> Save trip
        </Button>
      </div>
    </div>
  );
}
