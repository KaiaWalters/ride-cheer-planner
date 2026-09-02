# RideLog — Long-Distance Bike Trip & Energy Tracker

**Status:** draft spec v0.1 (for review)

## 1. Purpose

A collaborative planner and live journal for long-distance bike trips. A trip
creator plans routes, supplies, lodging and costs; contributors add detail
alongside them; riders log their energy level at each destination check-in; and
cheerleaders (friends & family) follow along and receive updates.

## 2. Stack

React 19 + TypeScript on TanStack Start (SSR + typed server functions), with
Lovable Cloud (Postgres + auth + storage + email) as the backend. Note: Vue/Nuxt
is not supported on this platform; the domain model below is stack-agnostic and
would port directly.

## 3. Roles & permissions

Roles are per-trip membership rows, not global user attributes.

| Capability | Owner | Contributor | Cheerleader | Viewer |
|---|---|---|---|---|
| View trip (route, progress, energy, rider comments) | yes | yes | yes | yes |
| View supplies, lodging, costs & budget | yes | yes | **no** | **no** |
| Edit trip details | yes | no | no | no |
| Add/edit destinations, supplies, lodging, costs | yes | yes | no | no |
| Log own check-in + energy | yes | yes | no | no |
| Invite/remove members | yes | no | no | no |
| Delete trip | yes | no | no | no |
| Receive update notifications | opt-in | opt-in | yes (default) | no |

Every member, cheerleaders included, must have an account and an `active`
membership row before any trip data is returned.

Owner is a single account; ownership transfer is out of scope for v1.

## 4. Domain model

- **profile** — id (= auth user), display_name, avatar_url, created_at.
- **trip** — id, owner_id, name, description, start_date, end_date, status
  (planning | active | completed), currency, distance_unit (km | mi, display
  default), created_at.
- **trip_member** — id, trip_id, user_id (nullable until invite accepted),
  invite_email, role (owner | contributor | cheerleader | viewer), status
  (invited | active | removed).
- **destination** — id, trip_id, name, position (integer, ordered), address,
  lat, lng, planned_arrival, notes, created_by.
- **supply** — id, trip_id, name, category, quantity, unit_cost, owner_note,
  packed (bool), created_by.
- **lodging** — id, trip_id, destination_id (nullable), name, check_in,
  check_out, cost, booking_ref, created_by.
- **check_in** — id, trip_id, destination_id, user_id, arrived_at,
  energy_level (1–10), mood_note, distance_km, created_at.
- **activity_event** — id, trip_id, actor_id, type, payload (jsonb),
  created_at. Single append-only source for the feed and email notifications.
- **notification_pref** — trip_id, user_id, email_enabled, frequency
  (instant | daily_digest).

All tables live in Postgres with row-level security: access is derived from an
active `trip_member` row, checked through a single security-definer function
`is_trip_member(trip_id, user_id, min_role)`.

## 5. Feature scope (v1)

**Accounts** — email/password sign up and sign in, profile with display name
and avatar.

**Trips** — create, edit, list ("My trips" split into owned / joined), trip
dashboard with status, dates, member avatars and progress (destinations reached
/ total).

**Destinations** — ordered list (drag to reorder), each with planned arrival,
optional coordinates and notes. Marking a destination reached happens via a
check-in.

**Supplies** — line items with quantity and unit cost, grouped by category,
packed checkbox. Auto-computed subtotal. Owner/contributor only.

**Lodging** — stays attached to a destination or standalone, with dates, cost
and booking reference. Owner/contributor only.

**Budget** — a single trip cost summary: supplies subtotal + lodging subtotal +
total, with per-category breakdown. No per-person splitting in v1.
Owner/contributor only — hidden and unreadable for cheerleaders/viewers.

**Energy check-ins** — at a destination a rider logs arrival time, energy 1–10,
optional comment and distance. The trip page shows a combined chart with one
line per rider over the trip timeline.

**Rider feed** — each rider has their own feed on the trip: average energy
across all their check-ins, their energy at every logged point (chart + list of
destination, time, energy), and their comments in chronological order.
Cheerleaders can open any rider's feed.

**Distance & units** — distances stored in kilometres; each trip has a
`distance_unit` default set by the owner. On the trip summary page any viewer
can toggle km/mi, converting total planned distance, distance from/between
destinations, and total distance travelled. The choice is remembered per viewer
and never changes stored data.

**Cheerleaders** — owner invites by email; the invite link requires the invitee
to sign up or sign in before any trip data loads. Once accepted they get a
read-only trip page: route, progress, energy, rider feeds and the activity feed
— no costs.

**Activity feed + email** — every meaningful action writes an
`activity_event` (check-in logged, destination reached, trip started/completed,
member joined). The trip page renders the feed; cost-related events are
filtered out for cheerleaders/viewers. Cheerleaders receive email: instant for
check-ins and trip status changes, or a daily digest, per their preference.
Unsubscribe link per trip.

## 6. Out of scope for v1

Live GPS tracking, mobile app, SMS/push, per-person expense splitting, route
mapping/turn-by-turn, offline mode, photo uploads, public shareable pages.

## 7. Design principles

- Thin routes: pages compose components; all data access goes through typed
  server functions in `*.functions.ts`.
- One module per aggregate (trips, destinations, supplies, lodging, check-ins,
  members, notifications) — each owns its schema, server functions and UI.
- Authorization in exactly two places: RLS policies in the database and a role
  guard in each server function. Never in components.
- Notifications depend on `activity_event` only, so new event types need no
  change to the delivery code.
- Zod schemas shared between form validation and server-function input
  validation — one definition per shape.

## 8. Build order

1. Backend enable + schema + RLS + auth pages
2. Trip CRUD and trip dashboard shell
3. Destinations
4. Supplies + lodging + budget summary
5. Check-ins and energy chart
6. Members, invites, roles
7. Activity feed + email notifications

## 9. Resolved decisions

- **Cheerleader visibility** — cheerleaders never see costs, budget, supplies or
  lodging. They see the route (destinations + order), progress, energy data and
  rider comments (`mood_note` on check-ins) only. Enforced by RLS: the supply,
  lodging and cost columns are unreadable for members whose role is
  `cheerleader` or `viewer`, not just hidden in the UI.
- **Energy is per rider** — every rider gets their own feed on the trip page
  showing: their average energy across all their check-ins, their energy at each
  logged point (chart + list), and their comments in chronological order. The
  trip page also shows a combined chart overlaying one line per rider.
- **Distance units are a per-trip preference** — `trip.distance_unit`
  (`km | mi`), set by the owner, is the storage-independent display default.
  Distances are always stored in kilometres and converted on display. On the
  trip summary page a viewer can switch units themselves (per-viewer override,
  remembered locally), which converts: total planned trip distance, distance
  between/from each destination, and total distance travelled so far.
- **No anonymous access** — a cheerleader must create an account and accept the
  invite before seeing any trip data. Invite links land on sign-up/sign-in; no
  public or preview page exists in v1.

