
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Webhook configuration is incomplete." },
      { status: 400 }
    );
  }

  // Read the original request body. Stripe signature verification
  // requires the unmodified raw body, not parsed JSON.
  const rawBody = await request.text();

  let event: Stripe.Event;

  try {
    const stripe = getStripe();

    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    );
  } catch (error) {
    console.error("Stripe signature verification failed:", error);

    return NextResponse.json(
      { error: "Invalid webhook signature." },
      { status: 400 }
    );
  }

  const supportedEvents = [
    "checkout.session.completed",
    "checkout.session.async_payment_succeeded",
    "checkout.session.expired",
  ];

  if (!supportedEvents.includes(event.type)) {
    return NextResponse.json({ received: true });
  }

  try {
    const session = event.data.object as Stripe.Checkout.Session;

    const paymentId = session.metadata?.payment_id;
    const invoiceId = session.metadata?.invoice_id;
    const clientId = session.metadata?.client_id;

    if (
      session.mode !== "payment" ||
      !paymentId ||
      !invoiceId ||
      !clientId ||
      !session.id ||
      session.amount_total === null ||
      !session.currency
    ) {
      console.error("Stripe Checkout Session is missing required payment details.");

      return NextResponse.json(
        { error: "Invalid Checkout Session metadata." },
        { status: 400 }
      );
    }

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null;

    const admin = createAdminClient();

    // The database function validates invoice ownership, amount,
    // currency, session ID and payment state in one transaction.
    const { data, error } = await admin.rpc(
      "process_stripe_checkout_event",
      {
        p_event_id: event.id,
        p_event_type: event.type,
        p_payment_id: paymentId,
        p_invoice_id: invoiceId,
        p_client_id: clientId,
        p_session_id: session.id,
        p_payment_intent_id: paymentIntentId,
        p_amount_cents: session.amount_total,
        p_currency: session.currency,
        p_is_paid: session.payment_status === "paid",
      }
    );

    if (error) {
      console.error("Stripe payment processing failed:", error);
      return NextResponse.json(
        { error: "Payment processing failed." },
        { status: 500 }
      );
    }

    console.log("Stripe webhook processed:", event.id, data);

    return NextResponse.json({
      received: true,
      result: data?.result ?? "processed",
    });
  } catch (error) {
    console.error("Stripe webhook handler failed:", error);

    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 }
    );
  }
}
