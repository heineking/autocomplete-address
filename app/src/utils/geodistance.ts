import { Geolocation } from '../types';

const toRadians = (degrees: number): number => degrees * (Math.PI / 180);

export const geodistance = (loc1: Geolocation) => (loc2: Geolocation): number => {
  const { lat: lat1, lon: lon1 } = loc1;
  const { lat: lat2, lon: lon2 } = loc2;

  const R = 6371e3; // metres
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians((lat2 - lat1));
  const Δλ = toRadians((lon2 - lon1));

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};
