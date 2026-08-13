import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  plan: "monthly" | "yearly";
  // Asks the server for a 7-day free trial (card still collected up front).
  trial?: boolean;
}

export function StripeEmbeddedCheckoutForm({ plan, trial }: Props) {
  const fetchClientSecret = async (): Promise<string> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Please sign in first");

    const resp = await fetch("/api/stripe-checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(trial ? { plan, trial: true } : { plan }),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok || !data?.clientSecret) {
      throw new Error(data?.error || "Failed to create checkout session");
    }
    return data.clientSecret;
  };

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
