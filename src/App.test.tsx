import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { App } from "./App";

function renderApp(route = "/") {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
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
    ).toHaveAttribute("href", "/#membership");
    expect(document.querySelector("#about")).toBeInTheDocument();
    expect(document.querySelector("#services")).not.toBeInTheDocument();
    expect(document.querySelector("#contact")).toBeInTheDocument();
  });

  it("keeps manager login available as a separate URL", async () => {
    const user = userEvent.setup();
    renderApp("/manager-login");
    expect(
      await screen.findByRole("heading", { name: /manager sign in/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: /primary navigation/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in securely/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/access requires a verified firebase account/i),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /forgot password/i }));
    expect(
      screen.getByRole("heading", { name: /reset your password/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send reset link/i }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/^password$/i)).not.toBeInTheDocument();
  });

  it("provides official online and downloadable membership options", async () => {
    const user = userEvent.setup();
    renderApp("/membership");
    expect(
      screen.getByRole("heading", { name: /start with verified information/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/confirm the current share capital, fees/i),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /contact the office/i })[0],
    ).toHaveAttribute("href", "/#contact");
    expect(screen.getByRole("link", { name: /download official form/i }))
      .toHaveAttribute(
        "href",
        "/downloads/Membership-Application-Form-Revised-2023.docx",
      );
    await user.click(screen.getByRole("button", { name: /apply online/i }));
    expect(
      screen.getByRole("heading", { name: /membership profile and agreement/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/family name/i)).toBeVisible();
  });

  it("uses homepage anchors for the public navigation", () => {
    const { container } = renderApp();
    const navigation = container.querySelector("#primary-nav");
    expect(navigation?.querySelector('a[href="#about"]')).toHaveTextContent(
      "About",
    );
    expect(
      navigation?.querySelector('a[href="#membership"]'),
    ).toHaveTextContent("Membership");
    expect(navigation?.querySelector('a[href="#services"]')).toBeNull();
    expect(navigation?.querySelector('a[href="#news"]')).toHaveTextContent(
      "News",
    );
    expect(navigation?.querySelector('a[href="#contact"]')).toHaveTextContent(
      "Contact",
    );
    expect(
      navigation?.querySelector('a[href="/#application"]'),
    ).toHaveTextContent("Apply now");
  });
});
