// keys.ts
export const normalizeScope = (p: any = {}) => ({
  cellId:             p?.cellId ?? null,
  churchId:           p?.churchId ?? null,
  districtId:         p?.districtId ?? null,
  nationalChurchId:   p?.nationalChurchId ?? p?.nationalId ?? null,
  from:               p?.from ?? null,
  to:                 p?.to ?? null,
});

// Always use object-style keys to avoid positional mismatch
export const meetingsKey  = (p?: any) => ['cell-meetings',  normalizeScope(p)];
export const reportsKey   = (p?: any) => ['cell-reports',   normalizeScope(p)];
export const analyticsKey = (p?: any) => ['cell-analytics', normalizeScope(p)];
