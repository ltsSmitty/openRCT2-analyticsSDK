import { getMetadata } from "../metadata/metadata";
import {
  registerEventEnqueueAction,
  registerFlushAndSaveEventsAction,
} from "../actions/registerAnalyticsActions";
import { config } from "../config";
import { flushOnSaveOrQuit } from "../hooks/onLoadOrQuit";

/**
 * Represents the properties of a tracked event.
 */
export type TrackEventProps = {
  name: string;
  [key: string]: any;
};

/**
 * Represents the type of a tracked event.
 */
export type TrackEventType = ReturnType<typeof getMetadata> & {
  properties: TrackEventProps;
};

/**
 * Represents the parameters for initializing the Analytics SDK.
 */
type AnalyticsSDKParams = {
  /**
   * The number of events to queue before flushing. Set to 1 to flush after every event.
   * May impact performance if set too low.
   */
  flushThreshold?: number;
  /**
   * Optional callback to be called when track() is called.
   */
  trackCallback?: (event: TrackEventType) => void;
  /**
   * To enable debug logging. Use to ensure events are being tracked/flushed correctly.
   */
  enableDebugLogging?: boolean;
};

const MAX_QUEUE_LENGTH = 1000;

export class Analytics {
  private eventQueue: TrackEventType[] = [];
  private flushThreshold: number = 25;
  private pluginName: string = "openRCT2-analytics-sdk";
  private enableDebugLogging: boolean = false;
  trackCallback?: (event: TrackEventType) => void;

  constructor(params: AnalyticsSDKParams) {
    if (params.trackCallback) {
      this.trackCallback = params.trackCallback;
    }

    if (params.flushThreshold) {
      this.setFlushThreshold(params.flushThreshold);
    }
  }

  init(
    props: AnalyticsSDKParams & {
      pluginName: string;
    }
  ) {
    this.pluginName = props.pluginName;

    if (props.trackCallback) {
      this.trackCallback = props.trackCallback;
    }

    if (props.flushThreshold) {
      this.setFlushThreshold(props.flushThreshold);
    }

    if (props.enableDebugLogging) {
      this.enableDebugLogging = true;
    }

    try {
      registerEventEnqueueAction(this._enqueEvent.bind(this));
      registerFlushAndSaveEventsAction((event) => {
        if (this.trackCallback) {
          this.trackCallback(event);
        }
      });
      flushOnSaveOrQuit(this);
    } catch (e) {
      console.log("Error registering actions. Did you call init() a second time?", e);
    }
  }

  /**
   * Sets the flush threshold for the event queue.
   * @param threshold - The number of events to queue before flushing.
   * @throws Error if the flush threshold is less than 1.
   */
  setFlushThreshold(threshold: number) {
    if (threshold < 1) {
      throw new Error("Flush threshold must be greater than 0");
    }
    this.flushThreshold = Math.ceil(Math.min(threshold, MAX_QUEUE_LENGTH));
    this.log(`Flush threshold set to ${this.flushThreshold}`);
  }

  /**
   * Tracks an event.
   * @param props - The properties of the event.
   */
  track<T extends TrackEventProps>(props: string | T) {
    const metadata = getMetadata(this.pluginName);
    const event = typeof props === "string" ? { name: props } : props;
    const eventData = {
      ...metadata,
      properties: event,
    };

    // safely call the action to enqueue the event rather than calling it directly
    // this lets it be disabled or hooked into
    context.executeAction(config.analyticsEventEnqueueKey, eventData);
  }

  /**
   * Flushes the event queue.
   */
  flush() {
    this.log(`Flushing ${this.eventQueue.length} events`);
    context.executeAction(config.analyticsFlushAndSaveKey, this.eventQueue, (result) => {
      if (result.error) {
        console.log("Error flushing events", result.errorTitle, result.errorMessage);
      } else {
        this.log("Events flushed");
        this.eventQueue = [];
      }
    });
  }

  /**
   * Not to be called directly, but through the registered gameaction via context.executeAction()
   * for network safety and hooking into.
   *
   * Use track() instead.
   * @param event - The event to enqueue.
   */
  _enqueEvent(event: TrackEventType) {
    this.log("Enqueing event", event.properties.name, this.eventQueue.length);

    this.eventQueue.push(event);
    if (this.eventQueue.length >= this.flushThreshold) {
      this.log(
        `Queue length ${this.eventQueue.length} exceeds threshold ${this.flushThreshold}, flushing`
      );
      this.flush();
    }
  }

  /**
   * Sets the track callback function.
   * @param callback - The callback function to be called when track() is called.
   */
  setTrackCallback(callback: (event: TrackEventType) => void) {
    this.trackCallback = callback;
  }

  log(...message: any) {
    if (this.enableDebugLogging) {
      console.log(message);
    }
  }
}

export const analytics = new Analytics({});
