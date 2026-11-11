
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";



export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Verify the authenticated user.
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

    // Verify the user's database role.
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json(
        { error: "403 Unauthorized." },
        { status: 403 }
      );
    }

    // Validate the submitted invoice data.
    const body = await request.json();

    const { client_id, amount, description, due_date } = body;

    if (
      typeof client_id !== "string" ||
      typeof amount !== "string" ||
      typeof description !== "string" ||
      typeof due_date !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid invoice details." },
        { status: 400 }
      );
    }

    const validAmount = /^\d+(\.\d{1,2})?$/.test(amount);
    const amountNumber = Number(amount);

    if (
      !validAmount ||
      !Number.isFinite(amountNumber) ||
      amountNumber < 5000 ||
      amountNumber > 50000
    ) {
      return NextResponse.json(
        { error: "Invoice amount must be between $5,000 and $50,000." },
        { status: 400 }
      );
    }

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(client_id)
    ) {
      return NextResponse.json(
        { error: "Invalid client." },
        { status: 400 }
      );
    }

    if (
      description.trim().length === 0 ||
      description.trim().length > 500
    ) {
      return NextResponse.json(
        { error: "Description must contain 1–500 characters." },
        { status: 400 }
      );
    }

    const parsedDate = new Date(`${due_date}T00:00:00.000Z`);

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(due_date) ||
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== due_date
    ) {
      return NextResponse.json(
        { error: "Invalid due date." },
        { status: 400 }
      );
    }

    // Confirm that the selected client exists.
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id")
      .eq("id", client_id)
      .maybeSingle();

    if (clientError || !client) {
      return NextResponse.json(
        { error: "Client not found." },
        { status: 404 }
      );
    }

    // Save the invoice with server-controlled values.
    const { data: invoice, error: insertError } = await supabase
      .from("invoices")
      .insert({
        invoice_number: `INV-${randomUUID().slice(0, 8).toUpperCase()}`,
        client_id,
        amount_cents: Math.round(amountNumber * 100),
        currency: "usd",
        description: description.trim(),
        status: "open",
        due_date,
        created_by: user.id,
      })
      .select("id, invoice_number, amount_cents, currency, status, due_date")
      .single();

    if (insertError) {
      console.error("Invoice creation failed:", insertError.message);

      return NextResponse.json(
        { error: "Unable to create invoice." },
        { status: 500 }
      );
    }

    return NextResponse.json({ invoice }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request or server error." },
      { status: 400 }
    );
  }
}
