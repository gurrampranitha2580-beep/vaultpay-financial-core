
"use client";

import { useRef, useState } from "react";

type PayNowButtonProps = {
  invoiceId: string;
};

export default function PayNowButton({
  invoiceId,
}: PayNowButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const paymentInProgress = useRef(false);

  async function handlePayment() {
    if (paymentInProgress.current) return;

    paymentInProgress.current = true;
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/client/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoice_id: invoiceId,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.url) {
        throw new Error(result.error || "Unable to start payment.");
      }

      window.location.assign(result.url);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );

      paymentInProgress.current = false;
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handlePayment}
        disabled={loading}
        aria-busy={loading}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading && (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
            aria-hidden="true"
          />
        )}

        {loading ? "Connecting..." : "Pay Now"}
      </button>

      {message && (
        <p className="mt-2 max-w-48 text-xs text-red-600">
          {message}
        </p>
      )}
    </div>
  );
}
