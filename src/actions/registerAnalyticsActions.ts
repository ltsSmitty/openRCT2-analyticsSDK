import { config } from "../config";
import { saveEventData } from "../io/saveData";
import { TrackEventType } from "../objects/analytics";

export const registerEventEnqueueAction = (callback: (eventData: TrackEventType) => void) => {
  context.registerAction(
    // The name of the action
    config.analyticsEventEnqueueKey,
    // The function to call on query()
    (_data) => {
      // todo check if analytics is enabled
      if (true) {
        return {} as GameActionResult;
      }
      return {
        error: 1,
        errorTitle: "Analytics Disabled",
        errorMessage: "Enable the Analytics plugin to use this feature.",
      } as GameActionResult;
    },
    // The function to call on execute()
    (data) => {
      const eventData = (data as { args: TrackEventType }).args;
      callback(eventData);
      return { data } as GameActionResult;
    }
  );
};

export const registerFlushAndSaveEventsAction = (
  callback: (eventData: TrackEventType) => void
) => {
  console.log("Registering event flushing/saving under the name", config.analyticsFlushAndSaveKey);
  context.registerAction(
    // The name of the action
    config.analyticsFlushAndSaveKey,
    // The function to call on query()
    (_data) => {
      // todo check if analytics is enabled
      if (true) {
        return {} as GameActionResult;
      }
      return {
        error: 1,
        errorTitle: "Analytics Disabled",
        errorMessage: "Enable the Analytics plugin to use this feature.",
      } as GameActionResult;
    },
    // The function to call on execute()
    (data) => {
      const trackedEvents = (data as { args: TrackEventType[] }).args;
      saveEventData(trackedEvents);
      trackedEvents.forEach((event) => {
        callback(event);
      });
      return { data } as GameActionResult;
    }
  );
};
