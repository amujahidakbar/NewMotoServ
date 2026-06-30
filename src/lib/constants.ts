export const DEFAULT_INTERVALS = {
  matic: {
    "Oli Mesin": 2500,
    "Busi": 8000,
    "Oli Transmisi": 8000,
    "Ban Depan": 20000,
    "Ban Belakang": 20000,
    "Drive Belt": 20000,
    "Coolant": 12000,
    "Kampas Rem": 15000,
    "Filter Udara": 12000,
    "Aki": 20000
  },
  manual: {
    "Oli Mesin": 2500,
    "Busi": 8000,
    "Ban Depan": 20000,
    "Ban Belakang": 20000,
    "Rantai": 15000,
    "Coolant": 12000,
    "Kampas Rem": 15000,
    "Filter Udara": 12000,
    "Aki": 20000
  },
  kopling: {
    "Oli Mesin": 2500,
    "Busi": 8000,
    "Ban Depan": 20000,
    "Ban Belakang": 20000,
    "Rantai": 15000,
    "Coolant": 12000,
    "Kampas Rem": 15000,
    "Filter Udara": 12000,
    "Aki": 20000
  }
} as const;

export type MotorType = keyof typeof DEFAULT_INTERVALS;

export function normalizeMotorType(type: string): MotorType {
  const t = type.toLowerCase();
  if (t === 'matic' || t === 'skuter') return 'matic';
  if (t === 'manual' || t === 'bebek') return 'manual';
  return 'kopling'; // default
}

export function getComponentsForType(type: string) {
  const norm = normalizeMotorType(type);
  return Object.keys(DEFAULT_INTERVALS[norm]) as Array<keyof typeof DEFAULT_INTERVALS[typeof norm]>;
}
