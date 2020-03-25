const EARTH_RADIUS = 6370986;

export const getBounds = (radius: number, lat: number, lon: number) => {
  const distance = (radius / EARTH_RADIUS * 2 * Math.PI) * 360;
  return {
    lat1: lat - distance,
    lat2: lat + distance,
    lon1: lon - distance,
    lon2: lon + distance,
  };
};
