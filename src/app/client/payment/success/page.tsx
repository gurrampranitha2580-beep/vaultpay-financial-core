
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
export const instant = false;
type Props = {
  searchParams: Promise<{
    session_id?: string;
  }>;
};

export default async function PaymentSuccessPage({
  searchParams,
}: Props) {
  await connection();
  const { profile } = await requireRole("client");
  const { session_id } = await searchParams;

  if (!session_id || !profile.client_id) {
    redirect("/client/dashboard");
  }

  const stripe = getStripe();

  let session;

  try {
    session = await stripe.checkout.sessions.retrieve(session_id);
  } catch {
    redirect("/client/dashboard");
  }

  const invoiceId = session.metadata?.invoice_id;
  const clientId = session.metadata?.client_id;

  if (
    session.mode !== "payment" ||
    session.payment_status !== "paid" ||
    clientId !== profile.client_id ||
    !invoiceId
  ) {
    redirect("/client/dashboard");
  }

  const supabase = await createClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("invoice_number, description, amount_cents, currency, status")
    .eq("id", invoiceId)
    .eq("client_id", profile.client_id)
    .maybeSingle();

  if (!invoice) {
    redirect("/client/dashboard");
  }

  const amount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: invoice.currency.toUpperCase(),
  }).format(session.amount_total! / 100);

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <section className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-sm border border-slate-200 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700 text-3xl">
          ✓
        </div>

        <h1 className="text-2xl font-semibold text-slate-900">
          Payment Successful
        </h1>

        <p className="mt-2 text-slate-600">
          Your payment has been received successfully.
        </p>

        <div className="mt-8 rounded-xl bg-slate-50 p-5 text-left space-y-3">
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Invoice</span>
            <span className="font-medium text-slate-900">
              {invoice.invoice_number}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Description</span>
            <span className="font-medium text-slate-900 text-right">
              {invoice.description}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Amount paid</span>
            <span className="font-semibold text-slate-900">
              {amount}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Invoice status</span>
            <span className="font-semibold text-green-700">
              {invoice.status === "paid" ? "Paid" : "Payment received"}
            </span>
          </div>
        </div>

        <Link
          href="/client/dashboard"
          className="mt-8 inline-flex w-full justify-center rounded-lg bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-800"
        >
          Return to Dashboard
        </Link>
      </section>
    </main>
  );
}
