export type DistanceUnit = "km" | "mi";

const KM_PER_MI = 1.609344;

export function fromKm(km: number, unit: DistanceUnit): number {
  return unit === "km" ? km : km / KM_PER_MI;
}

export function formatDistance(km: number | null | undefined, unit: DistanceUnit): string {
  if (km === null || km === undefined) return "—";
  return `${fromKm(Number(km), unit).toFixed(1)} ${unit}`;
}

const STORAGE_KEY = "ridelog:unit:";

export function readUnitPreference(tripId: string): DistanceUnit | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(STORAGE_KEY + tripId);
  return value === "km" || value === "mi" ? value : null;
}

export function writeUnitPreference(tripId: string, unit: DistanceUnit) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY + tripId, unit);
}

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}
