export interface ComponentHealth {
  name: string;
  run: number;
  remaining: number;
  percentage: number;
  status: 'danger' | 'warning' | 'success';
  statusLabel: 'Kritis' | 'Perlu Perhatian' | 'Baik';
  interval: number;
  lastServiceOdo: number;
}

export function calculateComponentHealth(
  name: string,
  currentOdo: number,
  lastServiceOdo: number,
  interval: number
): ComponentHealth {
  const run = Math.max(0, currentOdo - lastServiceOdo);
  const remaining = interval - run;
  
  // Calculate percentage: max(0, min(100, ((I - D_run) / I) * 100))
  let percentage = Math.round((remaining / interval) * 100);
  percentage = Math.max(0, Math.min(100, percentage));

  let status: 'danger' | 'warning' | 'success' = 'success';
  let statusLabel: 'Kritis' | 'Perlu Perhatian' | 'Baik' = 'Baik';

  if (remaining <= 0) {
    status = 'danger';
    statusLabel = 'Kritis';
  } else if (remaining <= interval * 0.2) {
    status = 'warning';
    statusLabel = 'Perlu Perhatian';
  }

  return {
    name,
    run,
    remaining,
    percentage,
    status,
    statusLabel,
    interval,
    lastServiceOdo
  };
}

export interface MotorHealth {
  overallPercentage: number;
  criticalCount: number;
  warningCount: number;
  componentsHealth: ComponentHealth[];
}

export function calculateMotorHealth(
  currentOdo: number,
  intervals: Record<string, number>,
  lastService: Record<string, number>
): MotorHealth {
  const components = Object.keys(intervals);
  if (components.length === 0) {
    return {
      overallPercentage: 100,
      criticalCount: 0,
      warningCount: 0,
      componentsHealth: []
    };
  }

  let totalPercentage = 0;
  let criticalCount = 0;
  let warningCount = 0;
  const componentsHealth: ComponentHealth[] = [];

  for (const comp of components) {
    const interval = intervals[comp] || 2000;
    const lastServiceOdo = lastService[comp] || 0;
    const health = calculateComponentHealth(comp, currentOdo, lastServiceOdo, interval);
    
    componentsHealth.push(health);
    totalPercentage += health.percentage;
    
    if (health.status === 'danger') {
      criticalCount++;
    } else if (health.status === 'warning') {
      warningCount++;
    }
  }

  const overallPercentage = Math.round(totalPercentage / components.length);

  return {
    overallPercentage,
    criticalCount,
    warningCount,
    componentsHealth
  };
}
