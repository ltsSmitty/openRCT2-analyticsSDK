import { config } from "src/config";

export const getParkId = () => {
  const parkId = context.getParkStorage().get(config.parkIdKey, null);
  if (parkId === null) {
    const newParkId = Date.now();
    context.getParkStorage().set(config.parkIdKey, newParkId);
    return newParkId;
  }
  return parkId;
};
