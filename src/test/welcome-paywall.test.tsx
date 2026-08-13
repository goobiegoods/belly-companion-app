import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

vi.mock("@/components/PromoCodeRedeem", () => ({
  PromoCodeRedeem: () => <div data-testid="promo-redeem" />,
}));
vi.mock("@/components/StripeEmbeddedCheckout", () => ({
  StripeEmbeddedCheckoutForm: ({ plan, trial }: { plan: string; trial?: boolean }) => (
    <div data-testid="stripe-checkout" data-plan={plan} data-trial={String(!!trial)} />
  ),
}));
vi.mock("@/components/golden", () => ({
  BellaOrb: () => <div />,
}));
vi.mock("@/lib/analytics", () => ({
  track: vi.fn(),
}));
vi.mock("sonner", () => ({
  toast: vi.fn(),
}));

// HARD_PAYWALL is baked at module load, so each test imports a fresh copy
// after stubbing (or not stubbing) VITE_HARD_PAYWALL.
const importPaywall = async () =>
  (await import("@/components/WelcomePaywall")).WelcomePaywall;

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.resetModules();
  vi.clearAllMocks();
});

describe("WelcomePaywall — flag OFF (default env)", () => {
  it("is dismissible and the CTA stays the placeholder toast", async () => {
    const WelcomePaywall = await importPaywall();
    const { toast } = await import("sonner");
    const onClose = vi.fn();
    render(<WelcomePaywall open onClose={onClose} />);

    expect(screen.getByLabelText("Close")).toBeInTheDocument();
    expect(screen.getByText("Maybe later")).toBeInTheDocument();
    expect(screen.getByText("Start my 7-day free trial")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Start my 7-day free trial"));
    expect(toast).toHaveBeenCalledWith("Checkout is coming soon — you're on the list");
    expect(screen.queryByTestId("stripe-checkout")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Maybe later"));
    expect(onClose).toHaveBeenCalled();
  });
});

describe("WelcomePaywall — dismissible={false}", () => {
  it("has no close affordances and ignores Escape", async () => {
    const WelcomePaywall = await importPaywall();
    const onClose = vi.fn();
    render(<WelcomePaywall open onClose={onClose} dismissible={false} source="hard_gate" />);

    expect(screen.queryByLabelText("Close")).not.toBeInTheDocument();
    expect(screen.queryByText("Maybe later")).not.toBeInTheDocument();
    // Promo redemption must remain available at the wall.
    expect(screen.getByTestId("promo-redeem")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("WelcomePaywall — flag ON", () => {
  it("CTA starts the trial and opens the real embedded checkout", async () => {
    vi.stubEnv("VITE_HARD_PAYWALL", "1");
    vi.resetModules();
    const WelcomePaywall = await importPaywall();
    render(<WelcomePaywall open dismissible={false} source="hard_gate" />);

    const cta = screen.getByText("Start your 7-day free trial");
    fireEvent.click(cta);

    const checkout = screen.getByTestId("stripe-checkout");
    // Default selected plan is annual, which maps to the API's "yearly".
    expect(checkout.getAttribute("data-plan")).toBe("yearly");
    expect(checkout.getAttribute("data-trial")).toBe("true");
  });
});
