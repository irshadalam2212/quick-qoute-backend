export const APP_FEATURES = [
  "DASHBOARD",
  "QUOTATIONS",
  "INVOICES",
  "CATALOG",
  "USERS",
  "AI",
] as const;

export type AppFeature = (typeof APP_FEATURES)[number];

// Baseline capabilities for regular and shared guest accounts.
export const DEFAULT_USER_FEATURES: AppFeature[] = [
  "DASHBOARD",
  "QUOTATIONS",
  "INVOICES",
  "CATALOG",
  "AI",
];

export const isAppFeature = (value: unknown): value is AppFeature =>
  typeof value === "string" && APP_FEATURES.includes(value as AppFeature);
