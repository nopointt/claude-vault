import { describe, test, expect } from "bun:test";
import { encrypt, decrypt } from "../crypto";
import { randomBytes } from "crypto";

describe("encrypt/decrypt", () => {
  const key = randomBytes(32);

  test("round-trips plaintext", () => {
    const plaintext = "hello world secret 12345";
    const packed = encrypt(plaintext, key);
    const result = decrypt(packed, key);
    expect(result).toBe(plaintext);
  });

  test("handles empty string", () => {
    const packed = encrypt("", key);
    const result = decrypt(packed, key);
    expect(result).toBe("");
  });

  test("handles unicode", () => {
    const plaintext = "Привет мир 🔑 日本語";
    const packed = encrypt(plaintext, key);
    const result = decrypt(packed, key);
    expect(result).toBe(plaintext);
  });

  test("handles large payload", () => {
    const plaintext = "x".repeat(100_000);
    const packed = encrypt(plaintext, key);
    const result = decrypt(packed, key);
    expect(result).toBe(plaintext);
  });

  test("produces different ciphertext each time (random IV)", () => {
    const plaintext = "same input";
    const a = encrypt(plaintext, key);
    const b = encrypt(plaintext, key);
    expect(Buffer.compare(a, b)).not.toBe(0);
  });

  test("fails with wrong key", () => {
    const packed = encrypt("secret", key);
    const wrongKey = randomBytes(32);
    expect(() => decrypt(packed, wrongKey)).toThrow();
  });

  test("fails with tampered ciphertext", () => {
    const packed = encrypt("secret", key);
    packed[packed.length - 1] ^= 0xff;
    expect(() => decrypt(packed, key)).toThrow();
  });

  test("packed format: IV (12) + authTag (16) + encrypted", () => {
    const packed = encrypt("test", key);
    expect(packed.length).toBeGreaterThan(12 + 16);
  });
});
