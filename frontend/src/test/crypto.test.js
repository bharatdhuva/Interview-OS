import { describe, it, expect, beforeAll } from "vitest";
import { encryptData, decryptData } from "../lib/crypto";

describe("crypto helpers", () => {
  // Generate a random 32-byte hex key for testing (64 hex characters)
  const hexKey = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

  it("should encrypt and decrypt data correctly", async () => {
    const originalData = {
      elements: [
        { id: "1", type: "rectangle", x: 10, y: 20, version: 1 },
        { id: "2", type: "ellipse", x: 30, y: 40, version: 2 }
      ],
      appState: { theme: "dark" }
    };

    const encrypted = await encryptData(originalData, hexKey);
    expect(encrypted).toBeTypeOf("string");
    expect(encrypted.length).toBeGreaterThan(0);

    const decrypted = await decryptData(encrypted, hexKey);
    expect(decrypted).toEqual(originalData);
  });

  it("should return raw data if no key is provided", async () => {
    const rawData = { elements: [] };
    const encrypted = await encryptData(rawData, null);
    expect(encrypted).toEqual(rawData);

    const decrypted = await decryptData(encrypted, null);
    expect(decrypted).toEqual(rawData);
  });

  it("should return raw payload if payload is not a string", async () => {
    const rawData = { elements: [] };
    const decrypted = await decryptData(rawData, hexKey);
    expect(decrypted).toEqual(rawData);
  });
});
