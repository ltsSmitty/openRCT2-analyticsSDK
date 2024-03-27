import { getParkId } from "src/io/getParkId";
import { config } from "../config";
import { generateUID } from "../utilities/generateUID";

function getMetadata(pluginName: string) {
  return {
    context: {
      park: {
        id: getParkId(),
        scenario: {
          fileName: scenario.filename,
          scenarioName: scenario.name,
          name: park.name,
        },
        inGameDate: {
          year: date.year,
          month: date.month,
          day: date.day,
          ticksElapsed: date.ticksElapsed,
          monthProgress: date.monthProgress,
        },
      },
      library: {
        pluginVersion: config.pluginVersion,
        apiVersion: context.apiVersion,
        eventPluginSource: pluginName,
      },
      network: {
        networkMode: network.mode,
        // add potentially other network info, like player id, etc.
      },
      mode: context.mode,
      // language could be nice, but isn't exposed
    },
    messageID: generateUID(),
    timestamp: new Date().toISOString(),
  };
}

export { getMetadata };
