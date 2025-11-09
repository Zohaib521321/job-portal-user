export const endpoints = {
  health: () => `/health`,
  jobs: (q?: string) => `/jobs${q ? `?${q}` : ''}`,
  job: (id: string | number) => `/jobs/${id}`,
  categories: () => `/categories`,
  templates: () => `/templates`,
  safetyAlerts: (q?: string) => `/safety-alerts${q ? `?${q}` : ''}`,
  safetyAlertsPublic: (q?: string) => `/safety-alerts/public${q ? `?${q}` : ''}`,
};


