export function clinicInstant(value: string): number {
  return Date.parse(/(?:Z|[+-]\d{2}:?\d{2})$/.test(value) ? value : value + '+07:00');
}
export function clinicDateKey(instant = Date.now()): string {
  return new Date(instant + 7 * 3600000).toISOString().slice(0,10);
}
