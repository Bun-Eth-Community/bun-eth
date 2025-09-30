import { expect, test, describe } from "bun:test";
import {
  isValidAddress,
  formatEther,
  parseEther,
  isValidTxHash,
  shortenAddress,
} from "./utils";

describe("utils", () => {
  describe("isValidAddress", () => {
    test("validates correct address", () => {
      expect(isValidAddress("0x1234567890123456789012345678901234567890")).toBe(true);
    });

    test("rejects invalid address", () => {
      expect(isValidAddress("0x123")).toBe(false);
      expect(isValidAddress("not an address")).toBe(false);
    });
  });

  describe("formatEther", () => {
    test("formats wei to ether", () => {
      expect(formatEther(1000000000000000000n)).toBe("1.000000000000000000");
      expect(formatEther(500000000000000000n)).toBe("0.500000000000000000");
    });
  });

  describe("parseEther", () => {
    test("parses ether to wei", () => {
      expect(parseEther("1.0")).toBe(1000000000000000000n);
      expect(parseEther("0.5")).toBe(500000000000000000n);
    });
  });

  describe("isValidTxHash", () => {
    test("validates correct tx hash", () => {
      const hash = "0x" + "a".repeat(64);
      expect(isValidTxHash(hash)).toBe(true);
    });

    test("rejects invalid tx hash", () => {
      expect(isValidTxHash("0x123")).toBe(false);
    });
  });

  describe("shortenAddress", () => {
    test("shortens address", () => {
      const addr = "0x1234567890123456789012345678901234567890";
      expect(shortenAddress(addr)).toBe("0x1234...7890");
      expect(shortenAddress(addr, 6)).toBe("0x123456...567890");
    });
  });
});
