import { checkBotId } from "botid/server";
import { PublicApiError } from "@/lib/api-errors";

export async function rejectAutomatedRequest() {
  const result = await checkBotId({ advancedOptions: { checkLevel: "basic" } });
  if (result.isBot) {
    throw new PublicApiError("BOT_DETECTED", "This request could not be completed.", 403, false);
  }
}