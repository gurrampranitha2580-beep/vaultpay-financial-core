
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Verify the logged-in user.
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    // 2. Verify the user's client role and linked company.
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, client_id")
      .eq("id", user.id)
      .single();

    if (
      profileError ||
      profile?.role !== "client" ||
      !profile.client_id
    ) {
      return NextResponse.json(
        { error: "Client access required." },
        { status: 403 }
      );
    }

    // 3. Validate the invoice ID.
    const body = await request.json();
    const invoiceId = body?.invoice_id;

    if (
      typeof invoiceId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        invoiceId
      )
    ) {
      return NextResponse.json(
        { error: "A valid invoice ID is required." },
        { status: 400 }
      );
    }

    // 4. Fetch only an open invoice belonging to this client.
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select(
        "id, invoice_number, amount_cents, currency, description, status"
      )
      .eq("id", invoiceId)
      .eq("client_id", profile.client_id)
      .eq("status", "open")
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: "Invoice not found or not payable." },
        { status: 404 }
      );
    }

    const amount = Number(invoice.amount_cents);
    const currency = invoice.currency.toLowerCase();

    if (
      !Number.isSafeInteger(amount) ||
      amount <= 0 ||
      !/^[a-z]{3}$/i.test(invoice.currency)
    ) {
      return NextResponse.json(
        { error: "Invoice payment details are invalid." },
        { status: 400 }
      );
    }

    // 5. Use the server-only admin client for payment records.
    const admin = createAdminClient();
    const stripe = getStripe();

    // 6. Check for an existing payment before creating another.
    const { data: existingPayment, error: existingError } =
      await admin
        .from("payments")
        .select("id, status, stripe_checkout_session_id")
        .eq("invoice_id", invoice.id)
        .in("status", ["pending", "succeeded"])
        .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existingPayment?.status === "succeeded") {
      return NextResponse.json(
        { error: "This invoice has already been paid." },
        { status: 409 }
      );
    }

    if (existingPayment?.status === "pending") {
      // A pending record without a session ID may mean another
      // request is currently creating its Checkout Session.
      if (!existingPayment.stripe_checkout_session_id) {
        return NextResponse.json(
          { error: "Payment is already being prepared. Please try again shortly." },
          { status: 409 }
        );
      }

      const existingSession = await stripe.checkout.sessions.retrieve(
        existingPayment.stripe_checkout_session_id
      );

      if (existingSession.status === "open" && existingSession.url) {
        return NextResponse.json({ url: existingSession.url });
      }

      if (existingSession.status === "complete") {
        return NextResponse.json(
          { error: "Payment is being processed. Please wait for confirmation." },
          { status: 409 }
        );
      }

      if (existingSession.status === "expired") {
        const { error: expireError } = await admin
          .from("payments")
          .update({ status: "failed" })
          .eq("id", existingPayment.id)
          .eq("status", "pending");

        if (expireError) {
          throw expireError;
        }
      }
    }

    // 7. Create a pending payment record before contacting Stripe.
    const { data: payment, error: paymentError } = await admin
      .from("payments")
      .insert({
        invoice_id: invoice.id,
        amount_cents: amount,
        currency,
        status: "pending",
      })
      .select("id")
      .single();

    if (paymentError || !payment) {
      console.error("Payment record creation failed:", paymentError);

      return NextResponse.json(
        {
          error:
            "A payment is already in progress or could not be created. Please try again.",
        },
        { status: 409 }
      );
    }

    // 8. Create the Stripe Checkout Session.
    const origin = new URL(request.url).origin;

    let session;

    try {
      session = await stripe.checkout.sessions.create(
        {
          mode: "payment",
          line_items: [
            {
              quantity: 1,
              price_data: {
                currency,
                unit_amount: amount,
                product_data: {
                  name: invoice.invoice_number,
                  description: invoice.description,
                },
              },
            },
          ],
          client_reference_id: invoice.id,
          metadata: {
            payment_id: payment.id,
            invoice_id: invoice.id,
            client_id: profile.client_id,
          },
          payment_intent_data: {
            metadata: {
              payment_id: payment.id,
              invoice_id: invoice.id,
              client_id: profile.client_id,
            },
          },
          success_url: `${origin}/client/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/client/dashboard`,
        },
        {
          idempotencyKey: `vaultpay_checkout_${payment.id}`,
        }
      );

      if (!session.url) {
        throw new Error("Stripe did not return a Checkout URL.");
      }
    } catch (stripeError) {
      // Release the invoice for a future retry if Stripe fails.
      await admin
        .from("payments")
        .update({ status: "failed" })
        .eq("id", payment.id)
        .eq("status", "pending");

      throw stripeError;
    }

    // 9. Save the Stripe Session ID against the payment record.
    const { error: updateError } = await admin
      .from("payments")
      .update({
        stripe_checkout_session_id: session.id,
      })
      .eq("id", payment.id)
      .eq("status", "pending");

    if (updateError) {
      // Do not leave an active Checkout Session without its database link.
      try {
        await stripe.checkout.sessions.expire(session.id);
      } catch (expireError) {
        console.error("Unable to expire unlinked Checkout Session:", expireError);
      }

      await admin
        .from("payments")
        .update({ status: "failed" })
        .eq("id", payment.id)
        .eq("status", "pending");

      throw updateError;
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout creation failed:", error);

    return NextResponse.json(
      { error: "Unable to start payment. Please try again." },
      { status: 500 }
    );
  }
}
