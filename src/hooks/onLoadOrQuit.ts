import { Analytics } from "../objects/analytics";

// hooks into the loadorquit action
const onLoadOrQuit = (loadOrQuitCallback: (result: GameActionEventArgs) => void) => {
  context.subscribe("action.execute", (data) => {
    if (data.action === "loadorquit") {
      loadOrQuitCallback(data);
    }
  });
};

// callback which flushes analytics events on load or quit
const loadOrQuitCallback = (_result: GameActionEventArgs, analyticsInstance: Analytics) => {
  analyticsInstance.track("Load or quit");
  analyticsInstance.flush();
};

export const flushOnSaveOrQuit = (analyticsInstance: Analytics) => {
  onLoadOrQuit((res) => loadOrQuitCallback(res, analyticsInstance));
};
