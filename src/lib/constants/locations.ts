export const NIGERIA_LOCATIONS = [
  "Abuja",
  "Lagos",
  "Benin",
  "Kaduna",
  "Port Harcourt",
  "Warri",
] as const;

export type NigeriaLocation = (typeof NIGERIA_LOCATIONS)[number];
