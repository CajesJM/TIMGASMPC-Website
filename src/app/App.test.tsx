import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { App } from "@/app/App";

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
    expect(screen.getByRole("link", { name: /download form/i }))
      .toHaveAttribute(
        "href",
        "/downloads/Membership-Application-Form-Revised-2023.docx",
      );
    expect(screen.getByRole("link", { name: /download xls/i })).toHaveAttribute(
      "href",
      "/downloads/Loan-Application-Form.xls",
    );
    await user.click(screen.getByRole("button", { name: /apply online/i }));
    const membershipCaptcha = screen.getByRole("dialog", {
      name: /verify before continuing/i,
    });
    await user.click(
      within(membershipCaptcha).getByRole("checkbox", { name: /i’m not a robot/i }),
    );
    expect(
      screen.getByRole("heading", { name: /membership profile and agreement/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("dialog", { name: /apply online to timgas mpc/i }),
    ).toBeVisible();
    expect(screen.getByLabelText(/family name/i)).toBeVisible();
    await user.keyboard("{Escape}");
    expect(
      screen.queryByRole("dialog", { name: /apply online to timgas mpc/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continue online/i }),
    ).toBeVisible();

    await user.click(screen.getByRole("button", { name: /apply for a loan/i }));
    const loanCaptcha = screen.getByRole("dialog", {
      name: /verify before continuing/i,
    });
    await user.click(
      within(loanCaptcha).getByRole("checkbox", { name: /i’m not a robot/i }),
    );
    expect(
      screen.getByRole("dialog", { name: /apply for a timgas mpc loan/i }),
    ).toBeVisible();
    const loanDialog = screen.getByRole("dialog", {
      name: /apply for a timgas mpc loan/i,
    });
    expect(
      screen.getByRole("heading", { name: /loan application form/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/applicant\/member borrower/i)).toBeVisible();
    expect(screen.getByLabelText(/mf \(first field\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mf \(second field\)/i)).toBeInTheDocument();
    expect(within(loanDialog).getByLabelText(/amount of cbu/i)).toBeVisible();
    expect(
      within(loanDialog).getByLabelText(/date released — timgas use only/i),
    ).toHaveAttribute("readonly");
    expect(within(loanDialog).getByLabelText(/amount of savings/i)).toBeVisible();
    expect(within(loanDialog).getByText(/amount approved/i)).toBeVisible();

    await user.type(
      screen.getByLabelText(/applicant\/member borrower/i),
      "Test Borrower",
    );
    await user.type(
      within(loanDialog).getByLabelText(/gmail address/i),
      "test.borrower@gmail.com",
    );
    await user.type(within(loanDialog).getByLabelText(/purok, house number, or street/i), "Purok 5");
    await user.selectOptions(
      within(loanDialog).getByLabelText(/municipality or city/i),
      "Trinidad",
    );
    await within(loanDialog).findByRole("option", { name: "Poblacion" });
    await user.selectOptions(
      within(loanDialog).getByLabelText(/^barangay/i),
      "Poblacion",
    );
    const purposeField = screen.getByLabelText(/purpose of loan/i);
    expect(purposeField).toHaveAttribute("maxlength", "5000");
    expect(within(loanDialog).getByText("0 / 5,000 characters")).toBeVisible();
    await user.type(purposeField, "Farm supplies");
    expect(within(loanDialog).getByText("13 / 5,000 characters")).toBeVisible();
    await user.type(screen.getByLabelText(/number of months/i), "12");
    await user.type(screen.getByLabelText(/amount applied/i), "10000");
    await user.type(screen.getByLabelText(/amount of cbu/i), "2500");
    await user.type(screen.getByLabelText(/amount of savings/i), "1500");
    await user.click(
      within(loanDialog).getByRole("button", { name: /^continue$/i }),
    );
    expect(screen.getByText(/step 2 of 5/i)).toBeInTheDocument();
    await user.click(
      within(loanDialog).getByRole("button", { name: /^continue$/i }),
    );
    expect(
      within(loanDialog).getByText(/add at least one property before continuing/i),
    ).toBeVisible();
    await user.click(
      within(loanDialog).getByRole("button", { name: /add asset/i }),
    );
    await user.type(
      within(loanDialog).getByLabelText(/property description/i),
      "Farm equipment",
    );
    await user.type(within(loanDialog).getByLabelText(/value \(₱\)/i), "8000");
    await user.click(
      within(loanDialog).getByRole("button", { name: /^continue$/i }),
    );
    expect(screen.getByText(/step 3 of 5/i)).toBeInTheDocument();
    await user.click(
      within(loanDialog).getByRole("button", { name: /^continue$/i }),
    );
    expect(
      within(loanDialog).getByText(
        /add at least one source of credit before continuing/i,
      ),
    ).toBeVisible();
    await user.click(
      within(loanDialog).getByRole("button", { name: /add debt record/i }),
    );
    await user.type(
      within(loanDialog).getByLabelText(/source of credit/i),
      "TIMGAS MPC",
    );
    await user.click(
      within(loanDialog).getByRole("button", { name: /^continue$/i }),
    );
    expect(screen.getByText(/step 4 of 5/i)).toBeInTheDocument();
    await user.type(
      screen.getByLabelText(/applicant\/member borrower typed name/i),
      "Test Borrower",
    );
    const consentContinueButton = within(loanDialog).getByRole("button", {
      name: /^continue$/i,
    });
    expect(consentContinueButton).toBeDisabled();
    await user.click(screen.getByLabelText(/reviewed and accept the official loan agreement/i));
    expect(consentContinueButton).toBeDisabled();
    await user.click(screen.getByLabelText(/acknowledge the official co-maker statement/i));
    expect(consentContinueButton).toBeDisabled();
    await user.click(screen.getByLabelText(/authorize timgas mpc to collect/i));
    expect(consentContinueButton).toBeEnabled();
    await user.click(consentContinueButton);
    expect(
      within(loanDialog).getByText(/spouse \/ marital consent is required/i),
    ).toBeVisible();
    expect(screen.getByText(/step 4 of 5/i)).toBeInTheDocument();
    await user.type(
      screen.getByLabelText(/spouse \/ marital consent/i),
      "Test Spouse",
    );
    await user.click(consentContinueButton);

    expect(screen.getByText(/step 5 of 5/i)).toBeInTheDocument();
    expect(loanDialog.querySelector("legend")).toHaveTextContent(
      "Review and submit",
    );
    const officialLoanPreview = within(loanDialog).getByLabelText(
      /official loan application preview/i,
    );
    expect(
      within(officialLoanPreview).getByRole("img", {
        name: /timgas mpc cooperative logo/i,
      }),
    ).toBeVisible();
    expect(
      within(officialLoanPreview).getByRole("heading", {
        name: /loan application form/i,
      }),
    ).toBeVisible();
    expect(within(officialLoanPreview).getByText("Farm equipment")).toBeVisible();
    expect(screen.queryByText(/loan application received/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /submit loan application/i }),
    ).toBeDisabled();
    await user.click(
      screen.getByLabelText(/reviewed the information above and i am ready/i),
    );
    expect(
      screen.getByRole("button", { name: /submit loan application/i }),
    ).toBeEnabled();
    await user.keyboard("{Escape}");
    expect(
      screen.queryByRole("dialog", { name: /apply for a timgas mpc loan/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continue loan form/i }),
    ).toBeVisible();
  }, 30_000);

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
