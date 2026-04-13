export type Perishability = 'high' | 'medium' | 'low' | 'none';

const DELIVERY_DAYS: Record<Perishability, number> = {
  high: 2,    // highly perishable — must ship in 2 days
  medium: 4,
  low: 7,
  none: 10,
};

export function calculateETA(perishability: Perishability): Date {
  const eta = new Date();
  eta.setDate(eta.getDate() + DELIVERY_DAYS[perishability]);
  // Skip to Monday if ETA lands on weekend
  if (eta.getDay() === 6) eta.setDate(eta.getDate() + 2);
  if (eta.getDay() === 0) eta.setDate(eta.getDate() + 1);
  return eta;
}

export function formatETA(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}
