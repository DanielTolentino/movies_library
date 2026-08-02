import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import FeedbackPanel from "./FeedbackPanel";

describe("FeedbackPanel", () => {
  it("renders a polite status by default", () => {
    render(<FeedbackPanel title="Sem filmes" message="Tente novamente mais tarde." />);

    const panel = screen.getByRole("status");
    expect(panel).toHaveClass("feedback-panel--neutral");
    expect(panel).toHaveAttribute("aria-live", "polite");
    expect(screen.getByText("Sem filmes")).toBeInTheDocument();
    expect(screen.getByText("Tente novamente mais tarde.")).toBeInTheDocument();
  });

  it("renders an assertive alert for the error tone", () => {
    render(<FeedbackPanel tone="error" title="Erro" message="Falhou." />);

    const panel = screen.getByRole("alert");
    expect(panel).toHaveClass("feedback-panel--error");
    expect(panel).toHaveAttribute("aria-live", "assertive");
  });

  it("calls onAction when the action button is clicked", async () => {
    const onAction = vi.fn();
    render(
      <FeedbackPanel title="Erro" message="Falhou." actionLabel="Tentar novamente" onAction={onAction} />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["only a label", { actionLabel: "Tentar novamente" }],
    ["only a handler", { onAction: () => {} }],
  ])("hides the button with %s", (_label, props) => {
    render(<FeedbackPanel title="Erro" message="Falhou." {...props} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
