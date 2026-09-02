import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Bike, LogOut, Plus, CalendarDays } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth";
import { createTrip, listMyTrips } from "@/lib/api/trips";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/trips/")({
  component: () => (
    <RequireAuth>
      <TripsPage />
    </RequireAuth>
  ),
  head: () => ({
    meta: [
      { title: "My trips — RideLog" },
      { name: "description", content: "All the bike trips you own or follow, with dates and status." },
      { property: "og:title", content: "My trips — RideLog" },
      { property: "og:description", content: "All the bike trips you own or follow, with dates and status." },
    ],
  }),
});

function TripsPage() {
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ["trips"],
    queryFn: listMyTrips,
  });

  const owned = trips.filter((t) => t.owner_id === user?.id);
  const joined = trips.filter((t) => t.owner_id !== user?.id);

  const create = useMutation({
    mutationFn: createTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      setOpen(false);
      toast.success("Trip created");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    create.mutate({
      owner_id: user!.id,
      name: String(form.get("name")),
      description: String(form.get("description") || "") || null,
      start_date: String(form.get("start_date") || "") || null,
      end_date: String(form.get("end_date") || "") || null,
      distance_unit: (String(form.get("distance_unit")) || "km") as "km" | "mi",
    });
  }

  return (
    <main className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2 text-primary">
            <Bike className="h-5 w-5" />
            <span className="font-display text-base font-bold">RideLog</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => signOut()}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl px-5 pt-6">
        <h1 className="text-2xl font-bold">My trips</h1>
        {isLoading && <p className="mt-4 text-sm text-muted-foreground">Loading…</p>}

        <TripGroup title="Trips I own" trips={owned} />
        <TripGroup title="Trips I'm on" trips={joined} />

        {!isLoading && trips.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No trips yet. Start one and add your first destination.
            </p>
          </div>
        )}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            size="lg"
            className="fixed right-5 bottom-6 z-30 h-14 rounded-full px-6 shadow-lg"
          >
            <Plus className="h-5 w-5" /> New trip
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>New trip</SheetTitle>
          </SheetHeader>
          <form onSubmit={submit} className="space-y-4 px-4 pb-8">
            <div className="space-y-2">
              <Label htmlFor="name">Trip name</Label>
              <Input id="name" name="name" required placeholder="Pacific Coast run" className="h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start</Label>
                <Input id="start_date" name="start_date" type="date" className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End</Label>
                <Input id="end_date" name="end_date" type="date" className="h-12" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="distance_unit">Default distance unit</Label>
              <Select name="distance_unit" defaultValue="km">
                <SelectTrigger id="distance_unit" className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="km">Kilometres</SelectItem>
                  <SelectItem value="mi">Miles</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="h-12 w-full" disabled={create.isPending}>
              {create.isPending ? "Creating…" : "Create trip"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </main>
  );
}

function TripGroup({
  title,
  trips,
}: {
  title: string;
  trips: Awaited<ReturnType<typeof listMyTrips>>;
}) {
  if (!trips.length) return null;
  return (
    <section className="mt-7">
      <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h2>
      <ul className="mt-3 space-y-3">
        {trips.map((trip) => (
          <li key={trip.id}>
            <Link
              to="/trips/$tripId"
              params={{ tripId: trip.id }}
              className="block rounded-2xl border bg-card p-4 transition-colors active:bg-accent/10"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-card-foreground">{trip.name}</h3>
                <Badge variant={trip.status === "active" ? "default" : "secondary"}>
                  {trip.status}
                </Badge>
              </div>
              {trip.description && (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{trip.description}</p>
              )}
              {(trip.start_date || trip.end_date) && (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {trip.start_date ?? "?"} → {trip.end_date ?? "?"}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
