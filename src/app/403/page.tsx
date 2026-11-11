
import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-semibold tracking-widest text-red-600">
          ACCESS DENIED
        </p>

        <h1 className="mt-4 text-6xl font-bold text-slate-900">
          403
        </h1>

        <h2 className="mt-4 text-xl font-semibold text-slate-900">
          Unauthorized
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          You do not have permission to access this resource.
          Please sign in with an authorized account.
        </p>

        <Link
          href="/login"
          className="mt-8 inline-flex rounded-lg bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Return to login
        </Link>
      </section>
    </main>
  );
}
