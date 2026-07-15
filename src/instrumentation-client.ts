import { initBotId } from "botid/client/core";

initBotId({
  protect: [
    { path: "/api/access/unlock", method: "POST", advancedOptions: { checkLevel: "basic" } },
    { path: "/api/tickets", method: "POST", advancedOptions: { checkLevel: "basic" } },
    { path: "/api/reviews", method: "POST", advancedOptions: { checkLevel: "basic" } },
  ],
});