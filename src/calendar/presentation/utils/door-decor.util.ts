// Orden "desordenado" de las puertas, como en los calendarios de adviento de toda la vida.
const SHUFFLED_24 = [7, 15, 3, 22, 11, 1, 18, 9, 24, 5, 13, 20, 2, 16, 10, 23, 6, 14, 19, 4, 12, 21, 8, 17];

export function doorLayout(totalDays: number): number[] {
  if (totalDays === SHUFFLED_24.length) return SHUFFLED_24;
  return Array.from({ length: totalDays }, (_, index) => index + 1);
}

export type DoorDecoration = 'ornament' | 'star' | 'bow' | 'snowflake' | 'sparkle' | 'gift';

const DECORATIONS: DoorDecoration[] = ['ornament', 'star', 'bow', 'snowflake', 'sparkle', 'gift'];
const SHADES = 6;

/** Cada puerta tiene su tono de naranja y su adorno, siempre los mismos. */
export function doorStyleOf(day: number): { shade: number; decoration: DoorDecoration } {
  return {
    shade: (day * 5) % SHADES,
    decoration: DECORATIONS[(day * 7) % DECORATIONS.length] ?? 'star',
  };
}
