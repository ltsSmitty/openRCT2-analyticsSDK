import { config } from "../config";
import { saveEventData } from "../io/saveData";
import { TrackEventType, analytics } from "../objects/analytics";

export const registerEventEnqueueAction = () => {
  console.log(
    "Registering event enqueue action under the name",
    config.analyticsEventEnqueueKey
  );
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
      analytics._enqueEvent(eventData);
      return { data } as GameActionResult;
    }
  );
};

export const registerFlushAndSaveEventsAction = () => {
  console.log(
    "Registering event flushing/saving under the name",
    config.analyticsFlushAndSaveKey
  );
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
        if (analytics.trackCallback) {
          analytics.trackCallback(event);
        }
      });
      return { data } as GameActionResult;
    }
  );
};
