
"use client";

import { useState, type FormEvent } from "react";

type ClientOption = {
  id: string;
  company_name: string;
  billing_email: string;
};

export default function CreateInvoiceForm({
  clients,
}: {
  clients: ClientOption[];
}) {
  const [clientId, setClientId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          amount,
          description,
          due_date: dueDate,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Unable to create invoice.");
        return;
      }

      setSuccess(true);
      setMessage(`Invoice ${result.invoice.invoice_number} created successfully.`);
      setClientId("");
      setAmount("");
      setDescription("");
      setDueDate("");
    } catch {
      setMessage("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">
          Create New Invoice
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Generate a corporate invoice for a registered client.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Select Client
          </label>
          <select
            required
            value={clientId}
            onChange={(event) => setClientId(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-blue-600"
          >
            <option value="">Choose a company</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.company_name} — {client.billing_email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Invoice Amount (USD)
          </label>
          <input
            required
            type="number"
            min="5000"
            max="50000"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="e.g. 12500.00"
            className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm text-slate-900 outline-none focus:border-blue-600"
          />
          <p className="mt-1 text-xs text-slate-500">
            Allowed range: $5,000–$50,000
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Due Date
          </label>
          <input
            required
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm text-slate-900 outline-none focus:border-blue-600"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Invoice Description
          </label>
          <textarea
            required
            maxLength={500}
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe the services or charges covered by this invoice"
            className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm text-slate-900 outline-none focus:border-blue-600"
          />
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={loading || clients.length === 0}
            className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating Invoice..." : "Generate Invoice"}
          </button>
        </div>

        {message && (
          <p
            role="status"
            className={`md:col-span-2 text-sm ${
              success ? "text-green-700" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </section>
  );
}
