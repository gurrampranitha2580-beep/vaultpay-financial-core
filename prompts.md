# Prompts.md

1. I'm starting the VaultPay project from scratch. Before we write any code, help me understand how the Admin and Client sides should work and how we should structure the application. Please follow the given project requirements and don't assume features that aren't mentioned.

2. I have created the login system, but I'm not sure how to connect the logged-in user with their role in the profiles table. Can you help me make the dashboard redirect users to the correct page based on whether they are Admin or Client?

3. I can hide the Admin dashboard link from Clients, but what if they directly enter the URL? How do I stop them from accessing the page? I want a proper server-side solution, not just a frontend restriction.

4. My Admin needs to create invoices for existing clients. Can you help me build this step by step? I want the invoice to be saved in Supabase and displayed in the correct Client dashboard. Also, make sure the Client cannot change the client ID and create invoices through the API.

5. I'm now moving to Stripe integration. I understand that Stripe handles the payment, but I'm confused about how my application creates the checkout session and redirects the Client. Can you explain the flow first and then help me implement it?

6. Suppose a Client clicks Pay Now twice or the internet is slow. How do we prevent duplicate payment sessions and charges? I want protection in the button as well as the backend. Please don't give me a solution that only works visually.

7. I completed the Stripe Checkout integration, but I'm not sure how to update the invoice status after payment. Should the success page update it? What is the correct role of a Stripe webhook here? Explain the difference and guide me through the implementation.

8. I'm getting stuck with Stripe webhook signature verification. I found examples using `constructEvent`, but I'm not sure why the original request body is required. Can you show me how to implement this correctly in my Next.js route?

9. My webhook endpoint is running on localhost. How can I test whether Stripe is actually sending events to it? Please guide me through Stripe CLI from installation to forwarding events, and tell me where to get the webhook signing secret.

10. Stripe is sending webhook events, but I'm worried that the same event might be processed more than once. How can I make the database handle duplicate events safely? I also want to make sure a failed or expired checkout doesn't accidentally mark an invoice as paid.

11. I want to generate an invoice PDF when the Client clicks Download PDF. I've installed pdf-lib, but I don't know how to format the document and return the PDF bytes correctly from a Next.js API route. Help me build this using the actual invoice details from Supabase.

12. I created a private Storage bucket for invoice PDFs. My PDF uploads successfully, but saving its storage path in the invoices table is failing. How can I identify whether this is a Supabase permission issue? Please diagnose the error before suggesting changes.

13. The invoice detail page is working, but I want to make sure one Client cannot download another Client's invoice by changing the invoice ID in the URL. How should I protect both the page and the PDF API route?

14. I want to test the application like an actual security auditor. If someone logs in as a Client and sends a request directly to an Admin API through Postman, what should happen? Help me check the authorization logic and identify any missing server-side protection.

15. My core features are working now. Can you compare what I've implemented against the official Track A handoff and tell me exactly what is still missing? Please distinguish between implemented, tested and unverified features. Don't add Fullstack requirements or suggest unnecessary features.
