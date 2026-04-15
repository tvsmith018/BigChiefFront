import { describe, expect, it } from "vitest";
import type { OTPResponse } from "@/_types/auth/otp/otpresponse";
import {
  extractUser,
  getCookieSettings,
  isAuthErrorUser,
  normalizeOtp,
  readOtp,
} from "./auth.helpers";

describe("getCookieSettings", () => {
  it("uses secure cookies in production", () => {
    expect(getCookieSettings(3600, "production")).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 3600,
    });
  });

  it("allows insecure cookies in development", () => {
    expect(getCookieSettings(3600, "development")).toEqual({
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 3600,
    });
  });
});

describe("extractUser", () => {
  it("returns null for nullish payload", () => {
    expect(extractUser(null)).toBeNull();
    expect(extractUser(undefined)).toBeNull();
  });

  it("unwraps nested data", () => {
    expect(
      extractUser({ data: { firstname: "T", lastname: "S" } })
    ).toEqual({ firstname: "T", lastname: "S" });
  });

  it("returns user-shaped payload directly", () => {
    expect(extractUser({ firstname: "Big", lastname: "Chief" })).toEqual({
      firstname: "Big",
      lastname: "Chief",
    });
  });
});

describe("isAuthErrorUser", () => {
  it("treats null as error", () => {
    expect(isAuthErrorUser(null)).toBe(true);
  });

  it("detects detail and messages shapes", () => {
    expect(isAuthErrorUser({ detail: "expired" } as never)).toBe(true);
    expect(
      isAuthErrorUser({
        messages: [
          { token_class: "AccessToken", token_type: "access", message: "expired" },
        ],
      } as never)
    ).toBe(true);
  });

  it("returns false for a normal user object", () => {
    expect(isAuthErrorUser({ firstname: "Valid" } as never)).toBe(false);
  });
});

describe("normalizeOtp", () => {
  it("maps data and message", () => {
    const resp = { data: "123456", message: "ok" } as unknown as OTPResponse;
    expect(normalizeOtp(resp)).toEqual({
      code: "123456",
      message: "ok",
    });
  });
});

describe("readOtp", () => {
  it("concatenates texbox fields", () => {
    const fd = new FormData();
    for (let i = 0; i <= 5; i++) fd.append(`texbox-${i}`, String(i));
    expect(readOtp(fd)).toBe("012345");
  });
});
