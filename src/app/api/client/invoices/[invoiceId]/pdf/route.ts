
import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, client_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "client" || !profile.client_id) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 403 }
    );
  }

  const { invoiceId } = await params;

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select(
      "id, invoice_number, amount_cents, currency, description, status, due_date, created_at, pdf_storage_path"
    )
    .eq("id", invoiceId)
    .eq("client_id", profile.client_id)
    .maybeSingle();

  if (invoiceError || !invoice) {
    return NextResponse.json(
      { error: "Invoice not found." },
      { status: 404 }
    );
  }

  const admin = createAdminClient();
  const bucket = admin.storage.from("invoice-pdfs");

  let pdfBytes: Uint8Array;

  if (invoice.pdf_storage_path) {
    const { data, error } = await bucket.download(
      invoice.pdf_storage_path
    );

    if (error || !data) {
      return NextResponse.json(
        { error: "Unable to retrieve invoice PDF." },
        { status: 500 }
      );
    }

    pdfBytes = new Uint8Array(await data.arrayBuffer());
  } else {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595.28, 841.89]);

    const regularFont = await pdf.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

    const formatAmount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: invoice.currency.toUpperCase(),
    }).format(Number(invoice.amount_cents) / 100);

    page.drawText("VAULTPAY FINANCIAL CORE", {
      x: 50,
      y: 780,
      size: 18,
      font: boldFont,
      color: rgb(0.12, 0.25, 0.48),
    });

    page.drawText("INVOICE", {
      x: 50,
      y: 720,
      size: 24,
      font: boldFont,
    });

    const details = [
      `Invoice Number: ${invoice.invoice_number}`,
      `Description: ${invoice.description}`,
      `Amount: ${formatAmount}`,
      `Status: ${invoice.status.toUpperCase()}`,
      `Issue Date: ${new Date(invoice.created_at).toLocaleDateString("en-US")}`,
      `Due Date: ${invoice.due_date}`,
    ];

    let y = 660;

    for (const detail of details) {
      page.drawText(detail, {
        x: 50,
        y,
        size: 12,
        font: regularFont,
      });

      y -= 35;
    }

    page.drawText("Thank you for your business.", {
      x: 50,
      y: 390,
      size: 11,
      font: regularFont,
      color: rgb(0.35, 0.35, 0.35),
    });

    pdfBytes = await pdf.save();

    const storagePath = `${profile.client_id}/${invoice.id}.pdf`;

    const { error: uploadError } = await bucket.upload(
      storagePath,
      pdfBytes,
      {
        contentType: "application/pdf",
        upsert: true,
      }
    );

    if (uploadError) {
      return NextResponse.json(
        { error: "Unable to store invoice PDF." },
        { status: 500 }
      );
    }

    const { error: updateError } = await admin
      .from("invoices")
      .update({ pdf_storage_path: storagePath })
      .eq("id", invoice.id);

    if (updateError) {
      await bucket.remove([storagePath]);

      return NextResponse.json(
        { error: "Unable to save invoice document reference." },
        { status: 500 }
      );
    }
  }

  const filename = `${invoice.invoice_number.replace(/[^a-zA-Z0-9._-]/g, "_")}.pdf`;

  return new Response(pdfBytes as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
