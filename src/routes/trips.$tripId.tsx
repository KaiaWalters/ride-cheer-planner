import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ChevronLeft, Loader2 } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth";
import { getTrip, myRole } from "@/lib/api/trips";
import { readUnitPreference, writeUnitPreference, type DistanceUnit } from "@/lib/units";
import { RouteTab } from "@/components/trip/RouteTab";
import { EnergyTab } from "@/components/trip/EnergyTab";
import { SuppliesTab } from "@/components/trip/SuppliesTab";
import { LodgingTab } from "@/components/trip/LodgingTab";
import { BudgetTab } from "@/components/trip/BudgetTab";
import { CrewTab } from "@/components/trip/CrewTab";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/trips/$tripId")({
  component: () => (
    <RequireAuth>
      <TripDetailPage />
    </RequireAuth>
  ),
  head: () => ({
    meta: [
      { title: "Trip details — RideLog" },
      {
        name: "description",
        content: "Route, energy check-ins, supplies, lodging, budget and crew for your bike trip.",
      },
      { property: "og:title", content: "Trip details — RideLog" },
      {
        property: "og:description",
        content: "Route, energy check-ins, supplies, lodging, budget and crew for your bike trip.",
      },
    ],
  }),
});

function TripDetailPage() {
  const { tripId } = Route.useParams();
  const { user } = useAuth();
  const userId = user?.id ?? "";

  const { data: trip, isLoading } = useQuery({
    queryKey: ["trip", tripId],
    queryFn: () => getTrip(tripId),
  });

  const { data: role } = useQuery({
    queryKey: ["role", tripId, userId],
    queryFn: () => myRole(tripId, userId),
    enabled: Boolean(userId),
  });

  const [unit, setUnit] = useState<DistanceUnit>("km");

  useEffect(() => {
    const stored = readUnitPreference(tripId);
    if (stored) setUnit(stored);
    else if (trip) setUnit(trip.distance_unit);
  }, [tripId, trip]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="mx-auto max-w-2xl p-6 text-center">
        <p className="text-muted-foreground">This trip isn’t available.</p>
        <Button asChild variant="secondary" className="mt-4">
          <Link to="/trips">Back to trips</Link>
        </Button>
      </div>
    );
  }

  const isOwner = trip.owner_id === userId || role === "owner";
  const canEdit = isOwner || role === "contributor";
  const canSeeCosts = canEdit;

  function toggleUnit() {
    const next: DistanceUnit = unit === "km" ? "mi" : "km";
    setUnit(next);
    writeUnitPreference(tripId, next);
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-3xl px-4 pb-16">
      <header className="flex items-center gap-2 py-4">
        <Button asChild size="icon" variant="ghost" aria-label="Back to trips">
          <Link to="/trips">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold">{trip.name}</h1>
          <p className="text-xs text-muted-foreground">{role ?? "member"}</p>
        </div>
        <Badge variant={trip.status === "active" ? "default" : "secondary"}>{trip.status}</Badge>
        <Button size="sm" variant="outline" onClick={toggleUnit}>
          {unit}
        </Button>
      </header>

      <Tabs defaultValue="route">
        <TabsList className="w-full overflow-x-auto">
          <TabsTrigger value="route">Route</TabsTrigger>
          <TabsTrigger value="energy">Energy</TabsTrigger>
          {canSeeCosts && <TabsTrigger value="supplies">Supplies</TabsTrigger>}
          {canSeeCosts && <TabsTrigger value="lodging">Lodging</TabsTrigger>}
          {canSeeCosts && <TabsTrigger value="budget">Budget</TabsTrigger>}
          <TabsTrigger value="crew">Crew</TabsTrigger>
        </TabsList>

        <TabsContent value="route" className="mt-4">
          <RouteTab tripId={tripId} unit={unit} canEdit={canEdit} userId={userId} />
        </TabsContent>
        <TabsContent value="energy" className="mt-4">
          <EnergyTab tripId={tripId} unit={unit} canLog={canEdit} userId={userId} />
        </TabsContent>
        {canSeeCosts && (
          <TabsContent value="supplies" className="mt-4">
            <SuppliesTab
              tripId={tripId}
              currency={trip.currency}
              canEdit={canEdit}
              userId={userId}
            />
          </TabsContent>
        )}
        {canSeeCosts && (
          <TabsContent value="lodging" className="mt-4">
            <LodgingTab tripId={tripId} currency={trip.currency} canEdit={canEdit} />
          </TabsContent>
        )}
        {canSeeCosts && (
          <TabsContent value="budget" className="mt-4">
            <BudgetTab tripId={tripId} currency={trip.currency} />
          </TabsContent>
        )}
        <TabsContent value="crew" className="mt-4">
          <CrewTab tripId={tripId} isOwner={isOwner} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
