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

  it("explains how to become a member on the membership page", () => {
    renderApp("/membership");
    expect(
      screen.getByRole("heading", { name: /four simple steps to membership/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/pay your share capital/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /apply online/i }),
    ).toHaveAttribute("href", "/apply");
    expect(
      screen.getByRole("link", { name: /download application form/i }),
    ).toHaveAttribute("href", "/application-form.pdf");
  });

  it("answers common questions on the FAQ page", () => {
    renderApp("/faq");
    expect(
      screen.getByRole("heading", { name: /answers to common questions/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/who can become a member of timgas/i),
    ).toBeInTheDocument();
  });
});
