import { analytics } from "../objects/analytics";

// hooks into the loadorquit action
const onLoadOrQuit = (
  loadOrQuitCallback: (result: GameActionEventArgs) => void
) => {
  context.subscribe("action.execute", (data) => {
    if (data.action === "loadorquit") {
      loadOrQuitCallback(data);
    }
  });
};

// callback which flushes analytics events on load or quit
const loadOrQuitCallback = (_result: GameActionEventArgs) => {
  analytics.track("Load or quit");
  analytics.flush();
};

export const flushOnSaveOrQuit = () => {
  onLoadOrQuit(loadOrQuitCallback);
};
