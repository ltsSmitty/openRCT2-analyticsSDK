import { getMetadata } from "../metadata/metadata";
import {
  registerEventEnqueueAction,
  registerFlushAndSaveEventsAction,
} from "../actions/registerAnalyticsActions";
import { config } from "../config";
import { flushOnSaveOrQuit } from "../hooks/onLoadOrQuit";

export type TrackEventProps = {
  name: string;
  [key: string]: any;
};

export type TrackEventType = ReturnType<typeof getMetadata> & {
  properties: TrackEventProps;
};

type AnalyticsSDKParams = {
  /** The number of events to queue before flushing. Set to 1 to flush after every event.
   * May impact performance if set too low.
   */
  flushThreshold?: number;
};

const MAX_QUEUE_LENGTH = 1000;

class Analytics {
  // todo future optimization, preallocate array size to save garbage collection
  private eventQueue: TrackEventType[] = [];
  private flushThreshold: number = 25;
  private pluginName: string = "openRCT2-analytics-sdk";

  constructor(params: AnalyticsSDKParams) {
    if (params.flushThreshold) {
      if (params.flushThreshold < 1) {
        throw new Error("Flush threshold must be greater than 0");
      }
      this.flushThreshold = Math.ceil(
        Math.min(params.flushThreshold, MAX_QUEUE_LENGTH)
      );
    }
  }

  init(props: { pluginName: string }) {
    this.pluginName = props.pluginName;

    try {
      registerEventEnqueueAction();
      registerFlushAndSaveEventsAction();
      flushOnSaveOrQuit();
    } catch (e) {
      console.log(
        "Error registering actions. Did you call init() a second time?",
        e
      );
    }
  }

  track<T extends TrackEventProps>(props: string | T, printDebug = false) {
    const metadata = getMetadata(this.pluginName);
    const event = typeof props === "string" ? { name: props } : props;
    const eventData = {
      ...metadata,
      properties: event,
    };
    // todo implement printDebug
    if (printDebug) {
      console.log(eventData);
    }
    // safely call the action to enqueue the event rather than calling it directly
    // this lets it be disabled or hooked into
    context.executeAction(config.analyticsEventEnqueueKey, eventData);
  }

  flush() {
    console.log("Flushing events", this.eventQueue.length);
    context.executeAction(
      config.analyticsFlushAndSaveKey,
      this.eventQueue,
      (result) => {
        if (result.error) {
          console.log(
            "Error flushing events",
            result.errorTitle,
            result.errorMessage
          );
        } else {
          console.log("Flushed events", this.eventQueue.length);
          this.eventQueue = [];
        }
      }
    );
  }

  /**
   * Not to be called directly, but through the registered gameaction via context.executeAction()
   *  for network safety and hooking into.
   *
   * Use track() instead.
   */
  _enqueEvent(event: TrackEventType) {
    console.log(
      "Enqueing event",
      event.properties.name,
      this.eventQueue.length
    );
    this.eventQueue.push(event);
    if (this.eventQueue.length >= this.flushThreshold) {
      console.log(
        `Queue length ${this.eventQueue.length} exceeds threshold ${this.flushThreshold}, flushing`
      );
      this.flush();
    }
  }
}

export const analytics = new Analytics({ flushThreshold: 100 });
