import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type CheckIn = Tables<"check_ins">;

export type CheckInWithNames = CheckIn & {
  profiles: { display_name: string } | null;
  destinations: { name: string } | null;
};

export async function listCheckIns(tripId: string) {
  const { data, error } = await supabase
    .from("check_ins")
    .select("*, profiles:user_id(display_name), destinations:destination_id(name)")
    .eq("trip_id", tripId)
    .order("arrived_at");
  if (error) throw error;
  return data as unknown as CheckInWithNames[];
}

export async function addCheckIn(input: TablesInsert<"check_ins">) {
  const { error } = await supabase.from("check_ins").insert(input);
  if (error) throw error;
}

export async function deleteCheckIn(id: string) {
  const { error } = await supabase.from("check_ins").delete().eq("id", id);
  if (error) throw error;
}

export function averageEnergy(rows: CheckIn[]) {
  if (!rows.length) return null;
  return rows.reduce((s, r) => s + r.energy_level, 0) / rows.length;
}

export function groupByRider(rows: CheckInWithNames[]) {
  const map = new Map<string, { name: string; rows: CheckInWithNames[] }>();
  for (const row of rows) {
    const entry = map.get(row.user_id) ?? {
      name: row.profiles?.display_name || "Rider",
      rows: [],
    };
    entry.rows.push(row);
    map.set(row.user_id, entry);
  }
  return [...map.entries()].map(([userId, value]) => ({ userId, ...value }));
}
