
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/require-role";
import LogoutButton from "./logout-button";
import CreateInvoiceForm from "./create-invoice-form";

export const instant = false;

export default async function AdminDashboardPage() {
  await connection();

  const { profile } = await requireRole("admin");
  const supabase = await createClient();
  const { data: paidInvoices, error: revenueError } = await supabase
  .from("invoices")
  .select("amount_cents")
  .eq("status", "paid");

const totalRevenueCents = (paidInvoices ?? []).reduce(
  (total, invoice) => total + Number(invoice.amount_cents),
  0
);

const totalRevenue = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
}).format(totalRevenueCents / 100);

  const { data: clients, error } = await supabase
    .from("clients")
    .select("id, company_name, billing_email, created_at")
    .order("created_at", { ascending: false });

  const clientOptions = (clients ?? []).map((client) => ({
    id: client.id,
    company_name: client.company_name,
    billing_email: client.billing_email,
  }));

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold tracking-wider text-blue-700">
            VAULTPAY FINANCIAL CORE
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-slate-500">
            Welcome back, {profile.full_name}
          </p>
        </div>
        <LogoutButton />
      </header>

      <section>
        <section className=" mt-5 mb-8">
  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <p className="text-sm font-medium text-slate-500">
      Total Revenue
    </p>
    {revenueError ? (
      <p className="mt-2 text-sm text-red-600">
        Unable to load revenue.
      </p>
    ) : (
      <p className="mt-2 text-3xl font-bold text-slate-900">
        {totalRevenue}
      </p>
    )}
    <p className="mt-1 text-sm text-slate-500">
      Revenue from successfully paid invoices
    </p>
  </div>
</section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Client Directory
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage your registered corporate clients.
            </p>
          </div>
          <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            {clients?.length ?? 0} Clients
          </span>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {error ? (
            <p className="p-6 text-sm text-red-600">
              Unable to load clients. Please refresh and try again.
            </p>
          ) : !clients?.length ? (
            <p className="p-6 text-sm text-slate-500">
              No clients have been registered yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Company</th>
                    <th className="px-6 py-4 font-semibold">Billing Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {client.company_name}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {client.billing_email}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <CreateInvoiceForm clients={clientOptions} />
    </main>
  );
}
