import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import {
  addSupply,
  deleteSupply,
  listSupplies,
  suppliesSubtotal,
  updateSupply,
} from "@/lib/api/supplies";
import { formatMoney } from "@/lib/units";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function SuppliesTab({
  tripId,
  currency,
  canEdit,
  userId,
}: {
  tripId: string;
  currency: string;
  canEdit: boolean;
  userId: string;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data: supplies = [] } = useQuery({
    queryKey: ["supplies", tripId],
    queryFn: () => listSupplies(tripId),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["supplies", tripId] });

  const add = useMutation({
    mutationFn: addSupply,
    onSuccess: () => {
      invalidate();
      setOpen(false);
      toast.success("Supply added");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const toggle = useMutation({
    mutationFn: ({ id, packed }: { id: string; packed: boolean }) => updateSupply(id, { packed }),
    onSuccess: invalidate,
  });
  const remove = useMutation({ mutationFn: deleteSupply, onSuccess: invalidate });

  const groups = supplies.reduce<Record<string, typeof supplies>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    add.mutate({
      trip_id: tripId,
      created_by: userId,
      name: String(f.get("name")),
      category: String(f.get("category") || "General"),
      quantity: Number(f.get("quantity") || 1),
      unit_cost: Number(f.get("unit_cost") || 0),
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card p-4">
        <p className="text-xs tracking-wide text-muted-foreground uppercase">Supplies subtotal</p>
        <p className="mt-1 text-2xl font-bold">
          {formatMoney(suppliesSubtotal(supplies), currency)}
        </p>
      </div>

      {Object.entries(groups).map(([category, items]) => (
        <section key={category} className="rounded-2xl border bg-card p-4">
          <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {category}
          </h3>
          <ul className="mt-3 divide-y">
            {items.map((s) => (
              <li key={s.id} className="flex items-center gap-3 py-3">
                <Checkbox
                  checked={s.packed}
                  disabled={!canEdit}
                  onCheckedChange={(v) => toggle.mutate({ id: s.id, packed: Boolean(v) })}
                />
                <div className="min-w-0 flex-1">
                  <p className={s.packed ? "text-sm line-through opacity-60" : "text-sm font-medium"}>
                    {s.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {s.quantity} × {formatMoney(Number(s.unit_cost), currency)}
                  </p>
                </div>
                <span className="text-sm font-semibold">
                  {formatMoney(Number(s.unit_cost) * s.quantity, currency)}
                </span>
                {canEdit && (
                  <Button variant="ghost" size="icon" onClick={() => remove.mutate(s.id)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}

      {supplies.length === 0 && (
        <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          Nothing packed yet.
        </p>
      )}

      {canEdit && (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="h-12 w-full">
              <Plus className="h-4 w-4" /> Add supply
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto rounded-t-3xl">
            <SheetHeader>
              <SheetTitle>Add supply</SheetTitle>
            </SheetHeader>
            <form onSubmit={submit} className="space-y-4 px-4 pb-8">
              <div className="space-y-2">
                <Label htmlFor="sname">Item</Label>
                <Input id="sname" name="name" required className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" placeholder="Food, Tools, Camping" className="h-12" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    defaultValue={1}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit_cost">Unit cost</Label>
                  <Input
                    id="unit_cost"
                    name="unit_cost"
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    defaultValue={0}
                    className="h-12"
                  />
                </div>
              </div>
              <Button type="submit" className="h-12 w-full" disabled={add.isPending}>
                Add supply
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
