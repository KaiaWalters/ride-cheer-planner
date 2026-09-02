import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Lodging = Tables<"lodging">;

export async function listLodging(tripId: string) {
  const { data, error } = await supabase
    .from("lodging")
    .select("*")
    .eq("trip_id", tripId)
    .order("check_in", { nullsFirst: false });
  if (error) throw error;
  return data;
}

export async function addLodging(input: TablesInsert<"lodging">) {
  const { error } = await supabase.from("lodging").insert(input);
  if (error) throw error;
}

export async function deleteLodging(id: string) {
  const { error } = await supabase.from("lodging").delete().eq("id", id);
  if (error) throw error;
}

export function lodgingSubtotal(rows: Lodging[]) {
  return rows.reduce((sum, r) => sum + Number(r.cost), 0);
}
