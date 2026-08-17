import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { App } from "./App";

function renderApp(route = "/") {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("TIMGAS website", () => {
  it("shows the cooperative value proposition on the home page", () => {
    renderApp();
    expect(
      screen.getByRole("heading", {
        name: /your partner in financial growth/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /become a member/i }),
    ).toHaveAttribute("href", "/apply");
  });

  it("labels the application as a frontend preview", () => {
    renderApp("/apply");
    expect(
      screen.getByText(/this form validates locally/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /submit application/i }),
    ).toBeEnabled();
  });
});
