import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Destination = Tables<"destinations">;

export async function listDestinations(tripId: string) {
  const { data, error } = await supabase
    .from("destinations")
    .select("*")
    .eq("trip_id", tripId)
    .order("position");
  if (error) throw error;
  return data;
}

export async function addDestination(input: TablesInsert<"destinations">) {
  const { error } = await supabase.from("destinations").insert(input);
  if (error) throw error;
}

export async function updateDestination(id: string, patch: Partial<Destination>) {
  const { error } = await supabase.from("destinations").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteDestination(id: string) {
  const { error } = await supabase.from("destinations").delete().eq("id", id);
  if (error) throw error;
}
