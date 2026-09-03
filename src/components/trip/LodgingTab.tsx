import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { BedDouble, Plus, Trash2 } from "lucide-react";
import { addLodging, deleteLodging, listLodging, lodgingSubtotal } from "@/lib/api/lodging";
import { formatMoney } from "@/lib/units";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function LodgingTab({
  tripId,
  currency,
  canEdit,
}: {
  tripId: string;
  currency: string;
  canEdit: boolean;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: rows = [] } = useQuery({
    queryKey: ["lodging", tripId],
    queryFn: () => listLodging(tripId),
  });

  const add = useMutation({
    mutationFn: addLodging,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lodging", tripId] });
      setOpen(false);
      toast.success("Lodging added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: deleteLodging,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lodging", tripId] }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl border bg-card p-4">
        <span className="text-sm text-muted-foreground">Lodging total</span>
        <span className="text-lg font-semibold">
          {formatMoney(lodgingSubtotal(rows), currency)}
        </span>
      </div>

      {canEdit && (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button className="h-12 w-full">
              <Plus className="mr-2 h-4 w-4" /> Add lodging
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl">
            <SheetHeader>
              <SheetTitle>Add lodging</SheetTitle>
            </SheetHeader>
            <form
              className="mt-4 space-y-4 pb-6"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                add.mutate({
                  trip_id: tripId,
                  name: String(fd.get("name") ?? "").trim(),
                  check_in: (fd.get("check_in") as string) || null,
                  check_out: (fd.get("check_out") as string) || null,
                  cost: Number(fd.get("cost") ?? 0),
                  booking_ref: (fd.get("booking_ref") as string) || null,
                });
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="lname">Name</Label>
                <Input id="lname" name="name" required className="h-12" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="check_in">Check in</Label>
                  <Input id="check_in" name="check_in" type="date" className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="check_out">Check out</Label>
                  <Input id="check_out" name="check_out" type="date" className="h-12" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost</Label>
                  <Input
                    id="cost"
                    name="cost"
                    type="number"
                    step="0.01"
                    defaultValue={0}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="booking_ref">Booking ref</Label>
                  <Input id="booking_ref" name="booking_ref" className="h-12" />
                </div>
              </div>
              <Button type="submit" className="h-12 w-full" disabled={add.isPending}>
                Save
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      )}

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          No lodging booked yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row.id} className="flex items-start gap-3 rounded-2xl border bg-card p-4">
              <BedDouble className="mt-1 h-4 w-4 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{row.name}</p>
                <p className="text-sm text-muted-foreground">
                  {[row.check_in, row.check_out].filter(Boolean).join(" → ") || "Dates TBD"}
                </p>
                {row.booking_ref && (
                  <p className="text-xs text-muted-foreground">Ref {row.booking_ref}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">
                  {formatMoney(Number(row.cost), currency)}
                </span>
                {canEdit && (
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Delete lodging"
                    onClick={() => remove.mutate(row.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
