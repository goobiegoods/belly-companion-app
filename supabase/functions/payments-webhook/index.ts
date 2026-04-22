import { createClient } from "npm:@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { type StripeEnv, createStripeClient, verifyWebhook } from "../_shared/stripe.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const url = new URL(req.url);
  const env = (url.searchParams.get("env") || "sandbox") as StripeEnv;

  try {
    const event = await verifyWebhook(req, env);
    console.log("Received event:", event.type, "env:", env);

    switch (event.type) {
      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object, env);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object, env);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object, env);
        break;
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object, env);
        break;
      case "checkout.session.expired":
        await handleCheckoutExpired(event.data.object);
        break;
      case "invoice.payment_failed":
        console.log("Payment failed:", event.data.object.id);
        break;
      default:
        console.log("Unhandled event:", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200, headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("Webhook error:", e);
    return new Response("Webhook error", { status: 400 });
  }
});

async function handleCheckoutCompleted(session: any, env: StripeEnv) {
  console.log("Checkout completed:", session.id, "mode:", session.mode);

  // SUBSCRIPTION fallback — if subscription.created hasn't fired yet, sync from session metadata.
  // This protects against race conditions on the success page.
  if (session.mode === "subscription") {
    const userId = session.metadata?.userId;
    if (!userId) { console.log("No userId in subscription checkout session"); return; }

    try {
      const stripe = createStripeClient(env);
      const sub = await stripe.subscriptions.retrieve(session.subscription as string);
      await handleSubscriptionCreated(sub, env);
    } catch (err) {
      console.error("Failed to sync subscription from checkout.session.completed:", err);
    }
    return;
  }

  // ONE-TIME payment (shop orders)
  if (session.mode !== "payment") return;
  if (session.payment_status !== "paid") {
    console.log("Skipping: payment_status =", session.payment_status);
    return;
  }

  const orderId = session.metadata?.orderId;
  if (!orderId) {
    console.log("No orderId in checkout session metadata");
    return;
  }

  const amountPaid = typeof session.amount_total === "number" ? session.amount_total / 100 : null;

  const { error } = await supabase.from("orders").update({
    status: "paid",
    amount_paid: amountPaid,
    paid_at: new Date().toISOString(),
    stripe_session_id: session.id,
  }).eq("id", orderId);

  if (error) console.error("Failed to mark order paid:", error);
  else console.log("Order marked paid:", orderId);
}

async function handleCheckoutExpired(session: any) {
  if (session.mode !== "payment") return;
  const orderId = session.metadata?.orderId;
  if (!orderId) return;

  const { error } = await supabase.from("orders").update({
    status: "abandoned",
  }).eq("id", orderId).eq("status", "pending_payment");

  if (error) console.error("Failed to mark order abandoned:", error);
  else console.log("Order marked abandoned:", orderId);
}

async function handleSubscriptionCreated(subscription: any, env: StripeEnv) {
  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error("No userId in subscription metadata");
    return;
  }
  const item = subscription.items?.data?.[0];
  const priceId = item?.price?.metadata?.lovable_external_id || item?.price?.id;
  const productId = item?.price?.product;
  const periodStart = subscription.current_period_start;
  const periodEnd = subscription.current_period_end;

  await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      product_id: productId,
      price_id: priceId,
      status: subscription.status,
      current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      environment: env,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" },
  );

  // Mirror to profiles.is_premium for quick UI checks
  const isActive = subscription.status === "active" || subscription.status === "trialing";
  await supabase.from("profiles").update({
    is_premium: isActive,
    premium_since: isActive ? new Date().toISOString() : null,
    premium_expires_at: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
  }).eq("user_id", userId);
}

async function handleSubscriptionUpdated(subscription: any, env: StripeEnv) {
  const item = subscription.items?.data?.[0];
  const priceId = item?.price?.metadata?.lovable_external_id || item?.price?.id;
  const productId = item?.price?.product;
  const periodStart = subscription.current_period_start;
  const periodEnd = subscription.current_period_end;

  await supabase
    .from("subscriptions")
    .update({
      status: subscription.status,
      product_id: productId,
      price_id: priceId,
      current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id)
    .eq("environment", env);

  const userId = subscription.metadata?.userId;
  if (userId) {
    const isActive = subscription.status === "active" || subscription.status === "trialing";
    await supabase.from("profiles").update({
      is_premium: isActive,
      premium_expires_at: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    }).eq("user_id", userId);
  }
}

async function handleSubscriptionDeleted(subscription: any, env: StripeEnv) {
  await supabase
    .from("subscriptions")
    .update({ status: "canceled", updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", subscription.id)
    .eq("environment", env);

  const userId = subscription.metadata?.userId;
  if (userId) {
    await supabase.from("profiles").update({ is_premium: false }).eq("user_id", userId);
  }
}
