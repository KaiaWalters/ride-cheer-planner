import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { MapPin, Plus, Trash2 } from "lucide-react";
import {
  addDestination,
  deleteDestination,
  listDestinations,
} from "@/lib/api/destinations";
import { formatDistance, type DistanceUnit } from "@/lib/units";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function RouteTab({
  tripId,
  unit,
  canEdit,
  userId,
}: {
  tripId: string;
  unit: DistanceUnit;
  canEdit: boolean;
  userId: string;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data: destinations = [] } = useQuery({
    queryKey: ["destinations", tripId],
    queryFn: () => listDestinations(tripId),
  });

  const add = useMutation({
    mutationFn: addDestination,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["destinations", tripId] });
      setOpen(false);
      toast.success("Destination added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: deleteDestination,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["destinations", tripId] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const totalKm = destinations.reduce((s, d) => s + Number(d.distance_km ?? 0), 0);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    add.mutate({
      trip_id: tripId,
      created_by: userId,
      name: String(f.get("name")),
      address: String(f.get("address") || "") || null,
      notes: String(f.get("notes") || "") || null,
      planned_arrival: String(f.get("planned_arrival") || "") || null,
      distance_km: f.get("distance_km") ? Number(f.get("distance_km")) : null,
      position: destinations.length,
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card p-4">
        <p className="text-xs tracking-wide text-muted-foreground uppercase">Total planned</p>
        <p className="mt-1 text-2xl font-bold">{formatDistance(totalKm, unit)}</p>
        <p className="text-xs text-muted-foreground">{destinations.length} destinations</p>
      </div>

      <ol className="space-y-3">
        {destinations.map((d, i) => (
          <li key={d.id} className="rounded-2xl border bg-card p-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold">{d.name}</h3>
                {d.address && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {d.address}
                  </p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  {d.planned_arrival ? new Date(d.planned_arrival).toLocaleString() : "No ETA"} ·{" "}
                  {formatDistance(d.distance_km, unit)} leg
                </p>
                {d.notes && <p className="mt-2 text-sm">{d.notes}</p>}
              </div>
              {canEdit && (
                <Button variant="ghost" size="icon" onClick={() => remove.mutate(d.id)}>
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              )}
            </div>
          </li>
        ))}
      </ol>

      {destinations.length === 0 && (
        <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          No destinations planned yet.
        </p>
      )}

      {canEdit && (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="h-12 w-full">
              <Plus className="h-4 w-4" /> Add destination
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto rounded-t-3xl">
            <SheetHeader>
              <SheetTitle>Add destination</SheetTitle>
            </SheetHeader>
            <form onSubmit={submit} className="space-y-4 px-4 pb-8">
              <div className="space-y-2">
                <Label htmlFor="dname">Name</Label>
                <Input id="dname" name="name" required className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" className="h-12" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="planned_arrival">Planned arrival</Label>
                  <Input
                    id="planned_arrival"
                    name="planned_arrival"
                    type="datetime-local"
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="distance_km">Leg distance (km)</Label>
                  <Input
                    id="distance_km"
                    name="distance_km"
                    type="number"
                    step="0.1"
                    inputMode="decimal"
                    className="h-12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" rows={3} />
              </div>
              <Button type="submit" className="h-12 w-full" disabled={add.isPending}>
                Add destination
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
