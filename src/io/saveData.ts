import { config } from "../config";
import { TrackEventType } from "../objects/analytics";

type SavedDataShape = {
  [eventName: string]: TrackEventType[];
};

export const saveEventData = (data: TrackEventType | TrackEventType[]) => {
  console.log("Saving data");
  const oldData = context.sharedStorage.get(
    config.dataKey,
    {}
  ) as SavedDataShape;

  if (Array.isArray(data)) {
    data.forEach((d) => {
      if (oldData[d.properties.name]) {
        oldData[d.properties.name].push(d);
      } else {
        oldData[d.properties.name] = [d];
      }
    });
  } else {
    if (oldData[data.properties.name]) {
      oldData[data.properties.name].push(data);
    } else {
      oldData[data.properties.name] = [data];
    }
  }
  context.sharedStorage.set(config.dataKey, oldData);
};
