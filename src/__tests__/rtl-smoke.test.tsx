import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

/** Local fixture to verify React Testing Library + jsdom without touching app components. */
function Fixture({ label }: Readonly<{ label: string }>) {
  return <span data-testid="fixture">{label}</span>;
}

describe("React Testing Library", () => {
  it("renders controlled output", () => {
    render(<Fixture label="ok" />);
    expect(screen.getByTestId("fixture")).toHaveTextContent("ok");
  });
});
