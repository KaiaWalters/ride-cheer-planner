import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Trip = Tables<"trips">;
export type TripMember = Tables<"trip_members">;

export async function listMyTrips() {
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getTrip(tripId: string) {
  const { data, error } = await supabase.from("trips").select("*").eq("id", tripId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createTrip(input: TablesInsert<"trips">) {
  const { data, error } = await supabase.from("trips").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateTrip(tripId: string, patch: Partial<Trip>) {
  const { error } = await supabase.from("trips").update(patch).eq("id", tripId);
  if (error) throw error;
}

export async function deleteTrip(tripId: string) {
  const { error } = await supabase.from("trips").delete().eq("id", tripId);
  if (error) throw error;
}

export type MemberWithProfile = TripMember & {
  profiles: { display_name: string } | null;
};

export async function listMembers(tripId: string) {
  const { data, error } = await supabase
    .from("trip_members")
    .select("*, profiles:user_id(display_name)")
    .eq("trip_id", tripId)
    .order("created_at");
  if (error) throw error;
  return data as unknown as MemberWithProfile[];
}

export async function inviteMember(
  tripId: string,
  email: string,
  role: TripMember["role"],
) {
  const { error } = await supabase
    .from("trip_members")
    .insert({ trip_id: tripId, invite_email: email, role, status: "invited" });
  if (error) throw error;
}

export async function removeMember(memberId: string) {
  const { error } = await supabase.from("trip_members").delete().eq("id", memberId);
  if (error) throw error;
}

export async function myRole(tripId: string, userId: string) {
  const { data, error } = await supabase
    .from("trip_members")
    .select("role")
    .eq("trip_id", tripId)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();
  if (error) throw error;
  return data?.role ?? null;
}
