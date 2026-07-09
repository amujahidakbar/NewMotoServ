export const DEFAULT_INTERVALS = {
  matic: {
    "Engine Oil": 2500,
    "Spark Plug": 8000,
    "Gear Oil": 8000,
    "Front Tyre": 20000,
    "Rear Tyre": 20000,
    "Drive Belt": 20000,
    "Coolant": 12000,
    "Brake Pads": 15000,
    "Air Filter": 12000,
    "Battery": 20000
  },
  manual: {
    "Engine Oil": 2500,
    "Spark Plug": 8000,
    "Front Tyre": 20000,
    "Rear Tyre": 20000,
    "Chain": 15000,
    "Coolant": 12000,
    "Brake Pads": 15000,
    "Air Filter": 12000,
    "Battery": 20000
  },
  kopling: {
    "Engine Oil": 2500,
    "Spark Plug": 8000,
    "Front Tyre": 20000,
    "Rear Tyre": 20000,
    "Chain": 15000,
    "Coolant": 12000,
    "Brake Pads": 15000,
    "Air Filter": 12000,
    "Battery": 20000
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
