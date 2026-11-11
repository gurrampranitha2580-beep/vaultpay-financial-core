
import Link from "next/link";

const features = [
  {
    number: "01",
    title: "Billing management",
    description:
      "Access billing records, review outstanding invoices and keep track of payment status.",
  },
  {
    number: "02",
    title: "Secure payments",
    description:
      "Complete invoice payments through Stripe's secure hosted checkout experience.",
  },
  {
    number: "03",
    title: "Invoice records",
    description:
      "Keep your billing history and payment information organized in one place.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-lg font-bold text-white">
              V
            </div>
            <div>
              <p className="text-base font-bold tracking-tight">
                VaultPay
              </p>
              <p className="text-[10px] font-semibold tracking-[0.16em] text-slate-500">
                FINANCIAL CORE
              </p>
            </div>
          </Link>

          <Link
            href="/login"
            className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Sign in
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-28">
        <div>
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-semibold tracking-wide text-blue-800">
            CORPORATE BILLING PLATFORM
          </p>

          <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Financial operations,
            <span className="text-blue-700"> made clearer.</span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-8 text-slate-600">
            A centralized billing portal for managing invoices,
            tracking outstanding payments and accessing your
            financial records with confidence.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Access your account
              <span className="ml-3" aria-hidden="true">
                →
              </span>
            </Link>

            <span className="text-sm text-slate-500">
              Secure access for authorized users
            </span>
          </div>

          <div className="mt-14 border-t border-slate-200 pt-7">
            <p className="text-xs font-semibold tracking-[0.15em] text-slate-400">
              BUILT FOR CORPORATE FINANCIAL WORKFLOWS
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Invoices · Payments · Billing records
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-5 rounded-3xl bg-blue-100/60 blur-2xl" />

          <div className="relative rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/60 sm:p-9">
            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
              <div>
                <p className="text-xs font-semibold tracking-wider text-slate-400">
                  VAULTPAY OVERVIEW
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">
                  Your billing workspace
                </h2>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <rect x="4" y="3" width="16" height="18" rx="2" />
                  <path d="M8 8h8M8 12h8M8 16h4" />
                </svg>
              </div>
            </div>

            <div className="mt-7 space-y-4">
              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">
                  Invoice management
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  All your billing records
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Review invoices and payment history.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-3 h-2 w-8 rounded-full bg-blue-600" />
                  <p className="text-sm font-semibold">Payments</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Secure online checkout
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-3 h-2 w-8 rounded-full bg-emerald-600" />
                  <p className="text-sm font-semibold">Records</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Organized invoice details
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-7 flex items-center gap-3 rounded-lg border border-slate-100 px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <span aria-hidden="true">✓</span>
              </div>
              <p className="text-xs leading-5 text-slate-600">
                A centralized space for corporate billing operations.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
          <div className="max-w-xl">
            <p className="text-xs font-semibold tracking-[0.16em] text-blue-700">
              THE VAULTPAY EXPERIENCE
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              Everything important, in one place.
            </h2>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.number}
                className="border-t border-slate-200 pt-6"
              >
                <p className="text-sm font-semibold text-blue-700">
                  {feature.number}
                </p>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <p>© 2026 VaultPay Financial Core</p>
        <p>Corporate billing and payment portal</p>
      </footer>
    </main>
  );
}
