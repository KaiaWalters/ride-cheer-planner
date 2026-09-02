import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { BatteryCharging, Plus } from "lucide-react";
import {
  addCheckIn,
  averageEnergy,
  groupByRider,
  listCheckIns,
} from "@/lib/api/checkins";
import { listDestinations } from "@/lib/api/destinations";
import { formatDistance, type DistanceUnit } from "@/lib/units";
import { EnergyChart } from "./EnergyChart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function EnergyTab({
  tripId,
  unit,
  canLog,
  userId,
}: {
  tripId: string;
  unit: DistanceUnit;
  canLog: boolean;
  userId: string;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [energy, setEnergy] = useState(7);

  const { data: checkIns = [] } = useQuery({
    queryKey: ["checkins", tripId],
    queryFn: () => listCheckIns(tripId),
  });
  const { data: destinations = [] } = useQuery({
    queryKey: ["destinations", tripId],
    queryFn: () => listDestinations(tripId),
  });

  const add = useMutation({
    mutationFn: addCheckIn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["checkins", tripId] });
      setOpen(false);
      toast.success("Check-in logged");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const riders = groupByRider(checkIns);
  const travelledKm = checkIns.reduce((s, c) => s + Number(c.distance_km ?? 0), 0);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const destinationId = String(f.get("destination_id") || "");
    add.mutate({
      trip_id: tripId,
      user_id: userId,
      destination_id: destinationId || null,
      energy_level: energy,
      mood_note: String(f.get("mood_note") || "") || null,
      distance_km: f.get("distance_km") ? Number(f.get("distance_km")) : null,
      arrived_at: new Date(String(f.get("arrived_at") || "") || Date.now()).toISOString(),
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-xs tracking-wide text-muted-foreground uppercase">Distance ridden</p>
          <p className="mt-1 text-xl font-bold">{formatDistance(travelledKm, unit)}</p>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-xs tracking-wide text-muted-foreground uppercase">Check-ins</p>
          <p className="mt-1 text-xl font-bold">{checkIns.length}</p>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-4">
        <h3 className="text-sm font-semibold">Team energy</h3>
        <div className="mt-3">
          <EnergyChart rows={checkIns} />
        </div>
      </div>

      <Accordion type="single" collapsible className="space-y-3">
        {riders.map((rider) => {
          const avg = averageEnergy(rider.rows);
          return (
            <AccordionItem
              key={rider.userId}
              value={rider.userId}
              className="rounded-2xl border bg-card px-4"
            >
              <AccordionTrigger className="hover:no-underline">
                <span className="flex items-center gap-2 text-left">
                  <BatteryCharging className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{rider.name}</span>
                  <span className="text-xs text-muted-foreground">
                    avg {avg?.toFixed(1) ?? "—"}/10
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pb-4">
                <EnergyChart rows={rider.rows} />
                <ul className="space-y-2">
                  {rider.rows.map((row) => (
                    <li key={row.id} className="rounded-xl bg-muted/60 p-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{row.destinations?.name ?? "En route"}</span>
                        <span>{new Date(row.arrived_at).toLocaleString()}</span>
                      </div>
                      <p className="mt-1 text-sm font-semibold">Energy {row.energy_level}/10</p>
                      {row.mood_note && <p className="mt-1 text-sm">{row.mood_note}</p>}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {canLog && (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button className="h-12 w-full">
              <Plus className="h-4 w-4" /> Log check-in
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto rounded-t-3xl">
            <SheetHeader>
              <SheetTitle>Log a check-in</SheetTitle>
            </SheetHeader>
            <form onSubmit={submit} className="space-y-5 px-4 pb-8">
              <div className="space-y-2">
                <Label htmlFor="destination_id">Destination</Label>
                <Select name="destination_id">
                  <SelectTrigger id="destination_id" className="h-12">
                    <SelectValue placeholder="Pick a stop" />
                  </SelectTrigger>
                  <SelectContent>
                    {destinations.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label>Energy: {energy}/10</Label>
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={[energy]}
                  onValueChange={(v) => setEnergy(v[0])}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="arrived_at">Arrived</Label>
                  <Input id="arrived_at" name="arrived_at" type="datetime-local" className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cdistance">Distance (km)</Label>
                  <Input
                    id="cdistance"
                    name="distance_km"
                    type="number"
                    step="0.1"
                    inputMode="decimal"
                    className="h-12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mood_note">How's it going?</Label>
                <Textarea id="mood_note" name="mood_note" rows={3} />
              </div>
              <Button type="submit" className="h-12 w-full" disabled={add.isPending}>
                Save check-in
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
