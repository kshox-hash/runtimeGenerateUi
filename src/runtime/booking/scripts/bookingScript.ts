import { BookingScriptConfig } from "../bookingTypes";

import { bookingStateScript } from "./bookingState";
import { bookingDomScript } from "./bookingDom";
import { bookingHelpersScript } from "./bookingHelpers";
import { bookingStepNavigationScript } from "./bookingStepNavigation";
import { bookingDateRendererScript } from "./bookingDataRenderer";
import { bookingTimeRendererScript } from "./bookingTimeRenderer";
import { bookingSubmitHandlerScript } from "./bookingSubmitHandler";
import { bookingSlotsLoaderScript } from "./bookingSlotsLoader";

import { bookingIconsScript } from "../bookingIcons";

export function renderBookingScript(config: BookingScriptConfig): string {
  return `
const TOKEN = ${JSON.stringify(config.token)};
const SUCCESS = ${JSON.stringify(config.successMessage)};

${bookingStateScript()}
${bookingDomScript()}
${bookingHelpersScript()}
${bookingIconsScript()}
${bookingStepNavigationScript()}
${bookingDateRendererScript()}
${bookingTimeRendererScript()}
${bookingSubmitHandlerScript()}
${bookingSlotsLoaderScript()}

initStepNavigation();
initSubmitHandler();
loadSlots();
`;
}