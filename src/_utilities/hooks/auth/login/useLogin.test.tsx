import { render } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const dispatchMock = vi.fn();

vi.mock("@/_store/hooks/UseAppDispatch", () => ({
  useAppDispatch: () => dispatchMock,
}));

vi.mock("@/_services/auth/authactions", () => ({
  loginAction: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useActionState: () => [
      { id: 1, firstname: "Terrance", lastname: "Smith", avatar: "" },
      vi.fn(),
      false,
    ],
  };
});

import { useLogin } from "./useLogin";

function Probe() {
  useLogin();
  return null;
}

describe("useLogin", () => {
  const assignSpy = vi.spyOn(window.location, "assign").mockImplementation(() => {});

  beforeEach(() => {
    dispatchMock.mockClear();
    assignSpy.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to /profile on successful login state", () => {
    render(<Probe />);
    expect(assignSpy).toHaveBeenCalledWith("/profile");
  });
});
