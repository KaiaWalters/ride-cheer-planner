import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Supply = Tables<"supplies">;

export async function listSupplies(tripId: string) {
  const { data, error } = await supabase
    .from("supplies")
    .select("*")
    .eq("trip_id", tripId)
    .order("category")
    .order("created_at");
  if (error) throw error;
  return data;
}

export async function addSupply(input: TablesInsert<"supplies">) {
  const { error } = await supabase.from("supplies").insert(input);
  if (error) throw error;
}

export async function updateSupply(id: string, patch: Partial<Supply>) {
  const { error } = await supabase.from("supplies").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteSupply(id: string) {
  const { error } = await supabase.from("supplies").delete().eq("id", id);
  if (error) throw error;
}

export function suppliesSubtotal(supplies: Supply[]) {
  return supplies.reduce((sum, s) => sum + Number(s.unit_cost) * s.quantity, 0);
}
