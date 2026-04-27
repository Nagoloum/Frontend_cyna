export const TWO_FA_ENABLED =
  String(import.meta.env.VITE_TWO_FA_ENABLED ?? 'true').toLowerCase() === 'false';
