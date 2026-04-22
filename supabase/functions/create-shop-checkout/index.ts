import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CartItem {
  id: string;
  name: string;
  price: number; // dollars
  qty: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { items, userId, customerEmail, returnUrl, environment, shippingFee } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "Cart is empty" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!userId || typeof userId !== "string") {
      return new Response(JSON.stringify({ error: "Missing userId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate each item
    for (const it of items as CartItem[]) {
      if (!it.id || !it.name || typeof it.price !== "number" || typeof it.qty !== "number" || it.price < 0 || it.qty < 1) {
        return new Response(JSON.stringify({ error: "Invalid cart item" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const env = (environment || "sandbox") as StripeEnv;
    const stripe = createStripeClient(env);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const itemsTotal = (items as CartItem[]).reduce((s, i) => s + i.price * i.qty, 0);
    const shipping = typeof shippingFee === "number" && shippingFee >= 0 ? shippingFee : 0;
    const total = itemsTotal + shipping;

    // Pre-create the order row in 'pending_payment' status so the webhook can flip it to 'paid'.
    const { data: orderRow, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        items: items as any,
        total,
        status: "pending_payment",
      })
      .select("id")
      .single();

    if (orderErr || !orderRow) {
      console.error("Failed to create order:", orderErr);
      return new Response(JSON.stringify({ error: "Failed to create order" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build line items using price_data (dynamic pricing — no preset Stripe products needed)
    const lineItems = (items as CartItem[]).map(i => ({
      price_data: {
        currency: "usd",
        product_data: { name: i.name },
        unit_amount: Math.round(i.price * 100),
      },
      quantity: i.qty,
    }));

    if (shipping > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Shipping" },
          unit_amount: Math.round(shipping * 100),
        },
        quantity: 1,
      });
    }

    const origin = req.headers.get("origin") || "";
    const successUrl = returnUrl || `${origin}/order-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/shop?canceled=1`;

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      ...(customerEmail && { customer_email: customerEmail }),
      metadata: { userId, orderId: orderRow.id, kind: "shop_order" },
      payment_intent_data: {
        metadata: { userId, orderId: orderRow.id, kind: "shop_order" },
      },
    });

    // Save session id on the order so webhook can match
    await supabase.from("orders").update({ stripe_session_id: session.id }).eq("id", orderRow.id);

    return new Response(JSON.stringify({ url: session.url, orderId: orderRow.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("create-shop-checkout error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
