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

const COMPONENT_TRANSLATIONS: Record<string, { en: string; id: string }> = {
  "engine oil": { en: "Engine Oil", id: "Oli Mesin" },
  "spark plug": { en: "Spark Plug", id: "Busi" },
  "gear oil": { en: "Gear Oil", id: "Oli Gardan" },
  "front tyre": { en: "Front Tyre", id: "Ban Depan" },
  "rear tyre": { en: "Rear Tyre", id: "Ban Belakang" },
  "drive belt": { en: "Drive Belt", id: "Drive Belt" },
  "coolant": { en: "Coolant", id: "Air Radiator" },
  "brake pads": { en: "Brake Pads", id: "Kampas Rem" },
  "air filter": { en: "Air Filter", id: "Filter Udara" },
  "battery": { en: "Battery", id: "Aki" },
  "chain": { en: "Chain", id: "Rantai" }
};

export function getComponentDisplayName(name: string, lang: 'en' | 'id'): string {
  const cleanName = name.trim().toLowerCase();
  
  for (const [key, mapping] of Object.entries(COMPONENT_TRANSLATIONS)) {
    if (cleanName === key) {
      return mapping[lang];
    }
  }
  
  if (cleanName === 'oli mesin' || cleanName === 'engine oil') {
    return lang === 'en' ? 'Engine Oil' : 'Oli Mesin';
  }
  if (cleanName === 'oli gardan' || cleanName === 'oli transmisi' || cleanName === 'gear oil' || cleanName === 'transmission oil') {
    return lang === 'en' ? 'Gear Oil' : 'Oli Gardan';
  }
  if (cleanName === 'busi' || cleanName === 'spark plug') {
    return lang === 'en' ? 'Spark Plug' : 'Busi';
  }
  if (cleanName === 'filter udara' || cleanName === 'saringan udara' || cleanName === 'air filter') {
    return lang === 'en' ? 'Air Filter' : 'Filter Udara';
  }
  if (cleanName === 'v-belt' || cleanName === 'drive belt' || cleanName === 'belt') {
    return lang === 'en' ? 'Drive Belt' : 'Drive Belt';
  }
  if (cleanName === 'rantai' || cleanName === 'chain') {
    return lang === 'en' ? 'Chain' : 'Rantai';
  }
  if (cleanName === 'kampas rem' || cleanName === 'brake pads' || cleanName === 'brake pad') {
    return lang === 'en' ? 'Brake Pads' : 'Kampas Rem';
  }
  if (cleanName === 'ban depan' || cleanName === 'front tyre') {
    return lang === 'en' ? 'Front Tyre' : 'Ban Depan';
  }
  if (cleanName === 'ban belakang' || cleanName === 'rear tyre') {
    return lang === 'en' ? 'Rear Tyre' : 'Ban Belakang';
  }
  if (cleanName === 'air radiator' || cleanName === 'coolant') {
    return lang === 'en' ? 'Coolant' : 'Air Radiator';
  }
  if (cleanName === 'aki' || cleanName === 'baterai' || cleanName === 'battery' || cleanName === 'accu') {
    return lang === 'en' ? 'Battery' : 'Aki';
  }
  
  return name;
}

export function getMotorTypeDisplayName(type: string, lang: 'en' | 'id'): string {
  const cleanType = type.trim().toLowerCase();
  if (cleanType === 'matic' || cleanType === 'skuter' || cleanType === 'automatic') {
    return lang === 'en' ? 'Automatic' : 'Otomatis';
  }
  if (cleanType === 'manual' || cleanType === 'bebek') {
    return lang === 'en' ? 'Manual' : 'Manual';
  }
  if (cleanType === 'kopling' || cleanType === 'sport' || cleanType === 'clutch') {
    return lang === 'en' ? 'Clutch' : 'Kopling';
  }
  return type;
}

