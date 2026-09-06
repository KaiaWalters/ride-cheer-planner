export type PitStopKind = "pharmacy" | "gas" | "rest" | "park";

export type TripStop = {
  id: string;
  name: string;
  address: string;
  distanceMi: number;
  durationLabel: string;
  description: string;
  /** position on the stylized map canvas, in percent */
  x: number;
  y: number;
};

export type PitStop = {
  id: string;
  name: string;
  kind: PitStopKind;
  address: string;
  offRouteMi: number;
  minutesAway: number;
  x: number;
  y: number;
};

export const PIT_STOP_LABEL: Record<PitStopKind, string> = {
  pharmacy: "Pharmacy",
  gas: "Gas station",
  rest: "Rest stop",
  park: "Park",
};

export const PIT_STOP_COLOR: Record<PitStopKind, string> = {
  pharmacy: "var(--destructive)",
  gas: "var(--chart-3)",
  rest: "var(--accent)",
  park: "var(--chart-4)",
};

export const TRIP_STOPS: TripStop[] = [
  {
    id: "s1",
    name: "Start: Home",
    address: "18 Alder Lane, Riverton, MA 02134",
    distanceMi: 0,
    durationLabel: "0 min",
    description: "Kick-off point. Fill bottles and check tyre pressure before rolling out.",
    x: 18,
    y: 12,
  },
  {
    id: "s2",
    name: "Riverside Park",
    address: "40 River Road, Riverton, MA 02134",
    distanceMi: 2.1,
    durationLabel: "42 min",
    description: "Shaded riverside path with benches and a water fountain by the boathouse.",
    x: 32,
    y: 27,
  },
  {
    id: "s3",
    name: "Lakeview Trail",
    address: "Lakeview Trailhead, Mapleton, MA 02135",
    distanceMi: 4.8,
    durationLabel: "1 hr 36 min",
    description: "Packed gravel loop around the lake. Exposed, so top up water before starting.",
    x: 52,
    y: 45,
  },
  {
    id: "s4",
    name: "City Botanical Garden",
    address: "123 Garden Way, Riverton, MA 02134",
    distanceMi: 6.2,
    durationLabel: "2 hr 4 min",
    description: "A large public garden with walking paths, seasonal exhibits, and rest areas.",
    x: 63,
    y: 58,
  },
  {
    id: "s5",
    name: "Historic District",
    address: "Old Market Square, Cedar Grove, MA 02138",
    distanceMi: 8.5,
    durationLabel: "2 hr 50 min",
    description: "Cobbled streets and cafés. Slow section — plan for a relaxed pace here.",
    x: 66,
    y: 76,
  },
  {
    id: "s6",
    name: "Finish: Coffee Shop",
    address: "9 Milltown Road, Milltown, MA 02141",
    distanceMi: 10.1,
    durationLabel: "3 hr 22 min",
    description: "End of the ride. Indoor bike parking and very good pastries.",
    x: 82,
    y: 90,
  },
];

export const PIT_STOPS: PitStop[] = [
  {
    id: "p1",
    name: "CVS Pharmacy",
    kind: "pharmacy",
    address: "220 Main St, Riverton",
    offRouteMi: 0.3,
    minutesAway: 6,
    x: 72,
    y: 22,
  },
  {
    id: "p2",
    name: "Walgreens",
    kind: "pharmacy",
    address: "88 Mapleton Ave, Mapleton",
    offRouteMi: 0.4,
    minutesAway: 8,
    x: 44,
    y: 49,
  },
  {
    id: "p3",
    name: "Mobil",
    kind: "gas",
    address: "456 Main St, Riverton",
    offRouteMi: 0.4,
    minutesAway: 8,
    x: 46,
    y: 10,
  },
  {
    id: "p4",
    name: "Garden Café",
    kind: "rest",
    address: "12 Garden Way, Riverton",
    offRouteMi: 0.1,
    minutesAway: 2,
    x: 48,
    y: 66,
  },
  {
    id: "p5",
    name: "Riverton Green",
    kind: "park",
    address: "Riverton Green, Riverton",
    offRouteMi: 0.3,
    minutesAway: 6,
    x: 56,
    y: 19,
  },
  {
    id: "p6",
    name: "Eastwood Commons",
    kind: "park",
    address: "Eastwood Commons, Eastwood",
    offRouteMi: 0.5,
    minutesAway: 10,
    x: 34,
    y: 82,
  },
  {
    id: "p7",
    name: "Shell",
    kind: "gas",
    address: "77 Brookfield Rd, Brookfield",
    offRouteMi: 0.6,
    minutesAway: 12,
    x: 52,
    y: 73,
  },
];

export const TRIP_SUMMARY = {
  name: "Long Ride Planner",
  tagline: "Plan, explore, and discover along the way.",
  totalMiles: 10.1,
  totalDuration: "3 hr 22 min",
};
