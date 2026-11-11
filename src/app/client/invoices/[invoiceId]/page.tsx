
import { connection } from "next/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  await connection();

  const { profile } = await requireRole("client");
  const { invoiceId } = await params;

  if (!profile.client_id) notFound();

  const supabase = await createClient();

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select(
      "id, invoice_number, amount_cents, currency, description, status, due_date, created_at"
    )
    .eq("id", invoiceId)
    .eq("client_id", profile.client_id)
    .maybeSingle();

  if (error || !invoice) notFound();

  const amount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: invoice.currency.toUpperCase(),
  }).format(Number(invoice.amount_cents) / 100);

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/client/dashboard"
          className="text-sm font-medium text-blue-700 hover:underline"
        >
          ← Back to Dashboard
        </Link>

        <header className="mt-8">
          <p className="text-sm font-semibold tracking-wider text-blue-700">
            VAULTPAY FINANCIAL CORE
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Invoice Details
          </h1>
          <p className="mt-2 text-slate-500">
            Review your invoice and payment information.
          </p>
        </header>

        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <p className="text-sm text-slate-500">Invoice Number</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {invoice.invoice_number}
              </h2>
            </div>

            <span
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                invoice.status === "paid"
                  ? "bg-green-50 text-green-700"
                  : invoice.status === "open"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-slate-100 text-slate-600"
              }`}
            >
              {invoice.status.toUpperCase()}
            </span>
          </div>

          <div className="grid gap-8 py-8 sm:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">Description</p>
              <p className="mt-2 font-medium text-slate-900">
                {invoice.description}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Invoice Amount</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {amount}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Issue Date</p>
              <p className="mt-2 font-medium text-slate-900">
                {invoice.created_at
                  ? new Date(invoice.created_at).toLocaleDateString("en-US")
                  : "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Due Date</p>
              <p className="mt-2 font-medium text-slate-900">
                {invoice.due_date
                  ? new Date(`${invoice.due_date}T00:00:00`).toLocaleDateString("en-US")
                  : "—"}
              </p>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-6">
  <a
    href={`/api/client/invoices/${invoice.id}/pdf`}
    className="inline-flex items-center rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
  >
    Download PDF
  </a>
</div>
        </section>
      </div>
    </main>
  );
}
