import { describe, expect, it } from "vitest";
import { GUIDED_PROFILE_EXAMPLE } from "@/components/profile-form";
import { profileInputSchema } from "@/schemas";

describe("guided profile example", () => {
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