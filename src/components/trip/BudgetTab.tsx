import { useQuery } from "@tanstack/react-query";
import { listSupplies, suppliesSubtotal } from "@/lib/api/supplies";
import { listLodging, lodgingSubtotal } from "@/lib/api/lodging";
import { formatMoney } from "@/lib/units";

export function BudgetTab({ tripId, currency }: { tripId: string; currency: string }) {
  const { data: supplies = [] } = useQuery({
    queryKey: ["supplies", tripId],
    queryFn: () => listSupplies(tripId),
  });
  const { data: lodging = [] } = useQuery({
    queryKey: ["lodging", tripId],
    queryFn: () => listLodging(tripId),
  });

  const suppliesTotal = suppliesSubtotal(supplies);
  const lodgingTotal = lodgingSubtotal(lodging);
  const total = suppliesTotal + lodgingTotal;

  const rows = [
    { label: "Supplies", value: suppliesTotal },
    { label: "Lodging", value: lodgingTotal },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card p-5">
        <p className="text-xs tracking-wide text-muted-foreground uppercase">Trip total</p>
        <p className="mt-1 text-3xl font-semibold">{formatMoney(total, currency)}</p>
      </div>
      <ul className="space-y-3">
        {rows.map((r) => (
          <li
            key={r.label}
            className="flex items-center justify-between rounded-2xl border bg-card p-4"
          >
            <span className="text-sm text-muted-foreground">{r.label}</span>
            <span className="font-semibold">{formatMoney(r.value, currency)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
