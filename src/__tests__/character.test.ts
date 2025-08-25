import { describe, expect, it } from "bun:test";
import { character } from "../index";

describe("Character Configuration", () => {
  it("should have all required fields", () => {
    const char = character();
    expect(char).toHaveProperty("name");
    expect(char).toHaveProperty("bio");
    expect(char).toHaveProperty("plugins");
    expect(char).toHaveProperty("style");
    expect(char).toHaveProperty("messageExamples");
  });

  it("should have the correct name", () => {
    const char = character();
    expect(char.name).toBe("Example Agent");
  });

  it("should have plugins defined as an array", () => {
    const char = character();
    expect(Array.isArray(char.plugins)).toBe(true);
  });

  it("should have conditionally included plugins based on environment variables", () => {
    const char = character();
    // This test is a simple placeholder since we can't easily test dynamic imports in test environments
    // The actual functionality is tested at runtime by the starter test suite

    // Save the original env values
    const originalRedisUrl = process.env.REDIS_URL;

    try {
      // Verify if plugins array includes the core plugin
      expect(char.plugins).toContain("@elizaos/plugin-sql");
      expect(char.plugins).toContain("@elizaos/plugin-bootstrap");

      // Plugins array should have conditional plugins based on environment variables
      if (process.env.REDIS_URL) {
        expect(char.plugins).toContain("@elizaos/plugin-redis");
      }
    } finally {
      // Restore original env values
      process.env.REDIS_URL = originalRedisUrl;
    }
  });

  it("should have a non-empty style configuration", () => {
    const char = character();
    expect(char.style).toBeTruthy();
    if (char.style) {
      expect(typeof char.style).toBe("object");
      expect(char.style.all).toBeDefined();
      expect(char.style.chat).toBeDefined();
      expect(char.style.post).toBeDefined();
    }
  });

  it("should have personality traits in bio array", () => {
    const char = character();
    expect(Array.isArray(char.bio)).toBe(true);
    if (char.bio && Array.isArray(char.bio)) {
      expect(char.bio.length).toBeGreaterThan(0);
      // Check if bio entries are non-empty strings
      char.bio.forEach((trait) => {
        expect(typeof trait).toBe("string");
        expect(trait.length).toBeGreaterThan(0);
      });
    }
  });

  it("should have message examples for training", () => {
    const char = character();
    expect(Array.isArray(char.messageExamples)).toBe(true);
    if (char.messageExamples && Array.isArray(char.messageExamples)) {
      expect(char.messageExamples.length).toBeGreaterThan(0);

      // Check structure of first example
      const firstExample = char.messageExamples[0];
      expect(Array.isArray(firstExample)).toBe(true);
      expect(firstExample.length).toBeGreaterThan(1); // At least a user message and a response

      // Check that messages have name and content
      firstExample.forEach((message) => {
        expect(message).toHaveProperty("name");
        expect(message).toHaveProperty("content");
        expect(message.content).toHaveProperty("text");
      });
    }
  });
});
