import { describe, expect, it } from "vitest";
import { splitFields } from "./split-fields";

const order = ["jobTitle", "company", "location", "startDate", "endDate", "description"];

describe("splitFields", () => {
  it("splits a fully pipe-delimited answer into each field", () => {
    const result = splitFields(
      "Senior Developer | Acme Co | Bangkok | 2020-01 | 2023-01 | Led the platform rewrite",
      order,
    );
    expect(result).toEqual({
      jobTitle: "Senior Developer",
      company: "Acme Co",
      location: "Bangkok",
      startDate: "2020-01",
      endDate: "2023-01",
      description: "Led the platform rewrite",
    });
  });

  it("leaves blank segments out of the result", () => {
    const result = splitFields("Senior Developer | Acme Co | | | | Led the rewrite", order);
    expect(result).toEqual({
      jobTitle: "Senior Developer",
      company: "Acme Co",
      description: "Led the rewrite",
    });
  });

  it("folds a stray '|' inside the description back into the last field", () => {
    const result = splitFields(
      "Senior Developer | Acme Co | | | | Cut latency | improved uptime",
      order,
    );
    expect(result.description).toBe("Cut latency | improved uptime");
  });

  it("puts the whole answer in the last field when the model ignores the format", () => {
    const result = splitFields("Just wrote some plain bullet points with no pipes at all.", order);
    expect(result).toEqual({
      description: "Just wrote some plain bullet points with no pipes at all.",
    });
  });

  it("returns an empty object for empty content", () => {
    expect(splitFields("", order)).toEqual({});
    expect(splitFields("   ", order)).toEqual({});
  });
});
