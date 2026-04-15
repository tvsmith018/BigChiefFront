import { describe, expect, it } from "vitest";
import { validateSignupConfirmInput } from "./signupValidation";

describe("validateSignupConfirmInput", () => {
  const valid = {
    confirmPassword: "secret",
    password: "secret",
    email: "a@b.com",
    firstname: "A",
    lastname: "B",
    dob: new Date("2000-01-01"),
  };

  it("returns null when all fields are valid", () => {
    expect(validateSignupConfirmInput(valid)).toBeNull();
  });

  it("rejects blank confirm password", () => {
    expect(validateSignupConfirmInput({ ...valid, confirmPassword: "" })).toEqual({
      confirmError: ["Cannot be blanked!!!"],
    });
  });

  it("rejects missing password", () => {
    expect(validateSignupConfirmInput({ ...valid, password: "" })).toEqual({
      confirmError: ["Missing password state, try again."],
    });
  });

  it("rejects password mismatch", () => {
    expect(
      validateSignupConfirmInput({ ...valid, confirmPassword: "a", password: "b" })
    ).toEqual({ confirmError: ["Passwords are not the same!!!!"] });
  });

  it("rejects missing email, firstname, lastname, dob", () => {
    expect(validateSignupConfirmInput({ ...valid, email: "" })).toEqual({
      networkError: ["Missing email state, try again."],
    });
    expect(validateSignupConfirmInput({ ...valid, firstname: "" })).toEqual({
      networkError: ["Missing firstname state, try again."],
    });
    expect(validateSignupConfirmInput({ ...valid, lastname: "" })).toEqual({
      networkError: ["Missing lastname state, try again."],
    });
    expect(validateSignupConfirmInput({ ...valid, dob: undefined })).toEqual({
      networkError: ["Missing dob state, try again."],
    });
  });
});
