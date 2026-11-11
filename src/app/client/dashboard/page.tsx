
import { connection } from "next/server";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import PayNowButton from "./pay-now-button";

export const instant = false;

export default async function ClientDashboardPage() {
  await connection();

  const { profile } = await requireRole("client");
  const supabase = await createClient();

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select(
      "id, invoice_number, amount_cents, currency, description, status, due_date, created_at"
    )
    .order("created_at", { ascending: false });

  const outstandingInvoices = (invoices ?? []).filter(
    (invoice) => invoice.status === "open"
  );

  const formatAmount = (amountCents: number, currency: string) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amountCents / 100);

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <header>
        <p className="text-sm font-semibold tracking-wider text-blue-700">
          VAULTPAY FINANCIAL CORE
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Client Dashboard
        </h1>
        <p className="mt-2 text-slate-500">
          Welcome, {profile.full_name}
        </p>
      </header>

      <section className="mt-10 grid gap-5 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Invoices
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {invoices?.length ?? 0}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Outstanding Invoices
          </p>
          <p className="mt-2 text-3xl font-bold text-amber-600">
            {outstandingInvoices.length}
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-slate-900">
          Billing History
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          View your company's invoices and payment status.
        </p>

        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {error ? (
            <p className="p-6 text-sm text-red-600">
              Unable to load invoices. Please refresh and try again.
            </p>
          ) : !invoices?.length ? (
            <p className="p-6 text-sm text-slate-500">
              No invoices found for your company.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Invoice</th>
                    <th className="px-6 py-4 font-semibold">Description</th>
                    <th className="px-6 py-4 font-semibold">Amount</th>
                    <th className="px-6 py-4 font-semibold">Due Date</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Payment</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
  <a
    href={`/client/invoices/${invoice.id}`}
    className="font-semibold text-blue-700 hover:text-blue-900 hover:underline"
  >
    {invoice.invoice_number}
  </a>
</td>

                      <td className="px-6 py-4 text-slate-600">
                        {invoice.description}
                      </td>

                      <td className="px-6 py-4 font-medium text-slate-900">
                        {formatAmount(
                          Number(invoice.amount_cents),
                          invoice.currency
                        )}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {invoice.due_date}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            invoice.status === "paid"
                              ? "bg-green-50 text-green-700"
                              : invoice.status === "open"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {invoice.status.toUpperCase()}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {invoice.status === "open" ? (
                          <PayNowButton invoiceId={invoice.id} />
                        ) : invoice.status === "paid" ? (
                          <span className="font-medium text-green-700">
                            Paid
                          </span>
                        ) : (
                          <span className="text-slate-400">Unavailable</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
