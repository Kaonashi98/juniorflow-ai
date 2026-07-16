import { describe, expect, it } from "vitest";
import { clearAccessRequiredError, GUIDED_PROFILE_EXAMPLE, INITIAL_TECHNOLOGIES } from "@/components/profile-form";
import { ClientApiError } from "@/lib/api-client";
import { profileInputSchema } from "@/schemas";

describe("guided profile example", () => {
  it("starts with no predefined technologies", () => {
    expect(INITIAL_TECHNOLOGIES).toEqual([]);
    expect(INITIAL_TECHNOLOGIES).not.toContain("React");
    expect(INITIAL_TECHNOLOGIES).not.toContain("TypeScript");
  });
  it("fills a valid profile but remains plain data and cannot submit itself", () => {
    expect(GUIDED_PROFILE_EXAMPLE).not.toHaveProperty("submit");
    const result = profileInputSchema.safeParse({
      ...GUIDED_PROFILE_EXAMPLE,
      predefinedTechnologies: GUIDED_PROFILE_EXAMPLE.technologies,
      technologies: [...GUIDED_PROFILE_EXAMPLE.technologies, "Docker"],
    });
    expect(result.success).toBe(true);
  });
});
describe("access error recovery", () => {
  it("clears only ACCESS_REQUIRED after an explicit unlock", () => {
    const accessError = new ClientApiError("Unlock first", "ACCESS_REQUIRED", false);
    const validationError = new ClientApiError("Invalid", "INVALID_INPUT", false);
    expect(clearAccessRequiredError(accessError)).toBeNull();
    expect(clearAccessRequiredError(validationError)).toBe(validationError);
    expect(clearAccessRequiredError(null)).toBeNull();
  });
});