# VaultPay Financial Core

A secure, role-based financial portal built with Next.js, React, TypeScript, Supabase, and Stripe. VaultPay helps businesses manage client invoices, track payments, and provide clients with a centralized billing experience.

## Overview

VaultPay Financial Core is designed for businesses that need a secure and reliable way to manage their billing operations.

The application provides separate dashboards for administrators and clients. Administrators can manage clients, create invoices, and monitor revenue, while clients can access their own billing history, view outstanding invoices, and make payments through Stripe Checkout.

The focus of this project is secure access control, reliable payment processing, and invoice document management.

Live-url: https://vaultpay-financial-core-nine.vercel.app/
Demo Client credentials: pranithag2580@gmail.com , Pranitha@2003

## Features

### Admin Dashboard
- View the client directory.
- Create invoices for existing clients.
- Monitor total revenue from paid invoices.
- Access administrative functionality through role-based authorization.

### Client Dashboard
- View personal billing history.
- Track outstanding and paid invoices.
- Access individual invoice details.
- Download invoice PDFs.
- Pay outstanding invoices securely through Stripe Checkout.

### Secure Authentication & Authorization
- Separate Admin and Client roles.
- Supabase authentication.
- Server-side role verification.
- Protected dashboard routes.
- Clients cannot access administrative pages.
- Invoice access is restricted to the invoice's assigned client.

### Payment Processing
- Stripe Checkout integration.
- Immediate loading state and disabled Pay button.
- Duplicate-click protection.
- Server-side payment validation.
- Stripe idempotency protection.
- Webhook signature verification.
- Payment and invoice status updates through verified Stripe events.

### Invoice Document Vault
- Dynamic invoice PDF generation using pdf-lib.
- Private Supabase Storage for invoice documents.
- Secure PDF retrieval through an authenticated API route.
- Native browser PDF download.

## Technology Stack

| Technology | Purpose |
|---|---|
| Next.js | Application framework |
| React | User interface |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Supabase | Authentication, database and storage |
| Stripe Checkout | Payment processing |
| Stripe Webhooks | Payment event verification |
| pdf-lib | PDF generation |
| Git & GitHub | Version control |

## Application Architecture

The application follows a role-based architecture:

- **Admin:** Manages clients, creates invoices, and views revenue.
- **Client:** Accesses only their own invoices and payment information.
- **Supabase:** Handles authentication, database operations, and private document storage.
- **Stripe:** Handles checkout and payment confirmation.
- **Webhook API:** Verifies Stripe events and updates payment records securely.

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- Git
- A Supabase project
- A Stripe account with test mode enabled

### Installation

Clone the repository:

```bash
git clone https://github.com/gurrampranitha2580-beep/vaultpay-financial-core.git
```

Navigate into the project:

```bash
cd vaultpay-financial-core
```

Install dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root and configure the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=

STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

Add your own credentials from your Supabase and Stripe dashboards. Never commit `.env.local` or expose secret keys in frontend code.

### Run Locally

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### Stripe Webhook Testing

For local webhook testing, install and authenticate Stripe CLI.

Forward Stripe events to the local application:

```bash
stripe listen --all-snapshot --forward-to localhost:3000/api/stripe/webhook
```

Use the webhook signing secret provided by Stripe CLI in your local `.env.local` file.

Restart the development server after changing environment variables.

## Important Security Practices

VaultPay uses multiple layers of protection:

- Authentication is verified on the server.
- User roles are checked before protected operations.
- Client invoice queries are scoped to the authenticated client's ID.
- Administrative API routes enforce Admin authorization.
- Payment amounts and invoice ownership are validated server-side.
- Stripe webhook signatures are verified before processing payment events.
- Duplicate payment requests and webhook events are handled through idempotency protections.
- Invoice PDFs are stored in a private Supabase Storage bucket.

## Project Structure

```text
src/
├── app/
│   ├── 403/
│   ├── admin/
│   │   └── dashboard/
│   ├── api/
│   │   ├── admin/
│   │   ├── client/
│   │   └── stripe/
│   ├── client/
│   │   ├── dashboard/
│   │   ├── invoices/
│   │   └── payment/
│   ├── dashboard/
│   ├── login/
│   └── page.tsx
│
├── lib/
│   ├── auth/
│   ├── stripe.ts
│   └── supabase/
│
└── proxy.ts
```

## Testing

The application has been tested during development for:

- Admin and Client login flows.
- Role-based dashboard access.
- Invoice creation and client-specific visibility.
- Stripe Checkout using test payment cards.
- Successful payment confirmation through webhooks.
- Invoice PDF generation and download.
- Pay button loading and duplicate-click protection.

## Project Information

**Project:** VaultPay Financial Core  
**Client:** Nexus Corporate Services  
**Business Contact:** Evelyn Croft, Chief Financial Officer  
**Project Track:** Frontend Engineering (React / Next.js)

## Future Improvements

- Production deployment and configuration.
- Additional security and integration testing.
- Further improvements to invoice management and reporting.

---

Built with Next.js, Supabase, and Stripe.
