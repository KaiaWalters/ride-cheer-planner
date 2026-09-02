import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Bike, BatteryCharging, Users, Route as RouteIcon } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "RideLog — Track your long-distance bike trip" },
      {
        name: "description",
        content:
          "Plan routes, supplies and lodging, log your energy at every stop, and let friends and family cheer you on.",
      },
      { property: "og:title", content: "RideLog — Track your long-distance bike trip" },
      {
        property: "og:description",
        content:
          "Plan routes, supplies and lodging, log your energy at every stop, and let friends and family cheer you on.",
      },
    ],
  }),
});

const features = [
  { icon: RouteIcon, title: "Plan the route", body: "Ordered destinations with distances, arrival times and notes." },
  { icon: BatteryCharging, title: "Log your energy", body: "Check in at each stop with an energy score 1–10 and a comment." },
  { icon: Users, title: "Bring cheerleaders", body: "Friends and family follow progress and energy — never your costs." },
];

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/trips" });
  }, [loading, user, navigate]);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-md px-5 pt-14 pb-16 sm:max-w-2xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          <Bike className="h-3.5 w-3.5" /> Long-distance ride companion
        </div>
        <h1 className="mt-5 text-4xl leading-tight font-bold text-foreground sm:text-5xl">
          Every mile, every stop, every ounce of energy.
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          RideLog is a shared trip plan and live journal for long rides. Plan together, check in from
          the roadside, and keep the people rooting for you in the loop.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-12 text-base">
            <Link to="/auth">Create your account</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 text-base">
            <Link to="/auth">Sign in</Link>
          </Button>
        </div>

        <div className="mt-12 grid gap-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border bg-card p-5">
              <f.icon className="h-5 w-5 text-primary" />
              <h2 className="mt-3 text-lg font-semibold text-card-foreground">{f.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
