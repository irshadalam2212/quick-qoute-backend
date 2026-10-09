/** Trims optional form text, storing blank values as null. */
export const optionalText = (value: string | null | undefined) =>
  value == null ? value : value.trim() || null;
