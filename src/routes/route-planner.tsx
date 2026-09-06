import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronUp } from "lucide-react";
import { StylizedMap } from "@/components/route/StylizedMap";
import { StopsPanel } from "@/components/route/StopsPanel";
import { StopDetail } from "@/components/route/StopDetail";
import { PitStopMenu } from "@/components/route/PitStopMenu";
import { TRIP_SUMMARY, type PitStop, type TripStop } from "@/lib/route-plan-data";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const Route = createFileRoute("/route-planner")({
  component: RoutePlannerPage,
  head: () => ({
    meta: [
      { title: "Route planner — RideLog" },
      {
        name: "description",
        content:
          "Plan your long-distance ride: order your stops, explore nearby pit stops, and preview the whole route on the map.",
      },
      { property: "og:title", content: "Route planner — RideLog" },
      {
        property: "og:description",
        content: "Order your stops, explore nearby pit stops, and preview the route on the map.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function RoutePlannerPage() {
  const isMobile = useIsMobile();
  const [stop, setStop] = useState<TripStop | null>(null);
  const [pit, setPit] = useState<PitStop | null>(null);
  const [listOpen, setListOpen] = useState(false);

  function selectStop(next: TripStop) {
    setPit(null);
    setStop(next);
    setListOpen(false);
  }

  function selectPitStop(next: PitStop) {
    setPit(next);
    setListOpen(false);
  }

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden">
      {/* desktop sidebar */}
      <aside className="hidden w-[380px] shrink-0 border-r bg-card lg:block">
        <StopsPanel
          selectedStopId={stop?.id ?? null}
          onSelectStop={selectStop}
          onSelectPitStop={selectPitStop}
        />
      </aside>

      <main className="relative min-w-0 flex-1">
        <StylizedMap
          selectedStopId={stop?.id ?? null}
          selectedPitStopId={pit?.id ?? null}
          onSelectStop={selectStop}
          onSelectPitStop={selectPitStop}
        />

        {/* desktop overlay panels above the map canvas */}
        {!isMobile && stop && !pit && (
          <div className="absolute top-4 right-4 z-20 max-h-[calc(100%-2rem)] w-[360px] animate-in fade-in slide-in-from-right-2 overflow-hidden rounded-2xl border bg-card shadow-xl duration-200">
            <StopDetail stop={stop} onClose={() => setStop(null)} onSelectPitStop={selectPitStop} />
          </div>
        )}
        {!isMobile && pit && (
          <div className="absolute top-4 right-4 z-30 w-[340px] animate-in fade-in zoom-in-95 overflow-hidden rounded-2xl border bg-card shadow-xl duration-200">
            <PitStopMenu pit={pit} onClose={() => setPit(null)} />
          </div>
        )}

        {/* mobile summary bar */}
        <button
          type="button"
          onClick={() => setListOpen(true)}
          className="absolute inset-x-3 bottom-3 z-20 flex items-center justify-between rounded-2xl border bg-card px-4 py-3 text-left shadow-xl lg:hidden"
        >
          <span>
            <span className="block text-sm font-bold">{TRIP_SUMMARY.name}</span>
            <span className="block text-xs text-muted-foreground">
              {TRIP_SUMMARY.totalMiles} miles · {TRIP_SUMMARY.totalDuration} (est.)
            </span>
          </span>
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        </button>
      </main>

      {/* mobile sheets */}
      <Sheet open={isMobile && listOpen} onOpenChange={setListOpen}>
        <SheetContent side="bottom" className="h-[85dvh] rounded-t-3xl p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Trip stops</SheetTitle>
          </SheetHeader>
          <StopsPanel
            selectedStopId={stop?.id ?? null}
            onSelectStop={selectStop}
            onSelectPitStop={selectPitStop}
          />
        </SheetContent>
      </Sheet>

      <Sheet
        open={isMobile && Boolean(stop) && !pit}
        onOpenChange={(open) => !open && setStop(null)}
      >
        <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto rounded-t-3xl p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>{stop?.name ?? "Stop"}</SheetTitle>
          </SheetHeader>
          {stop && (
            <StopDetail stop={stop} onClose={() => setStop(null)} onSelectPitStop={selectPitStop} />
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={isMobile && Boolean(pit)} onOpenChange={(open) => !open && setPit(null)}>
        <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto rounded-t-3xl p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>{pit?.name ?? "Pit stop"}</SheetTitle>
          </SheetHeader>
          {pit && <PitStopMenu pit={pit} onClose={() => setPit(null)} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}
