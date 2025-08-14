// functions/api/quote.ts
import type { PagesFunction } from "@cloudflare/workers-types";
import { Resend } from "resend";

interface Env {
  RESEND_API_KEY: string;
  TO_EMAIL: string;
}

type Body = {
  lang: "en" | "es";
  quote: {
    sqft: number;
    bedrooms: number;
    bathrooms: number;
    extras: Record<string, boolean>;
    total: number;
  };
  booking: null | {
    name: string;
    email: string;
    phone: string;
    address: string;
    date: string;
    notes: string;
  };
};

export const onRequestPost: any = async ({ request, env })=> {
  try {
    const data = (await request.json()) as Body;

    const resend = new Resend(env.RESEND_API_KEY);

    const subject =
      data.lang === "es"
        ? `Nueva cotización de limpieza - ${data.booking?.name ?? "Cliente"}`
        : `New cleaning quote - ${data.booking?.name ?? "Customer"}`;

    const extrasList =
      Object.entries(data.quote.extras)
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join(", ") || (data.lang === "es" ? "Ninguno" : "None");

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif">
        <h2>Mendoza Cleaning Services</h2>
        <p><b>Language:</b> ${data.lang}</p>
        <h3>Quote</h3>
        <ul>
          <li>Sqft: ${data.quote.sqft}</li>
          <li>Bedrooms: ${data.quote.bedrooms}</li>
          <li>Bathrooms: ${data.quote.bathrooms}</li>
          <li>Extras: ${extrasList}</li>
          <li><b>Total:</b> $${data.quote.total.toFixed(2)}</li>
        </ul>
        ${
          data.booking
            ? `<h3>Booking details</h3>
               <ul>
                 <li>Name: ${escapeHtml(data.booking.name)}</li>
                 <li>Email: ${escapeHtml(data.booking.email)}</li>
                 <li>Phone: ${escapeHtml(data.booking.phone)}</li>
                 <li>Address: ${escapeHtml(data.booking.address)}</li>
                 <li>Date: ${escapeHtml(data.booking.date)}</li>
                 <li>Notes: ${escapeHtml(data.booking.notes)}</li>
               </ul>`
            : "<p>(No booking info submitted)</p>"
        }
      </div>`;

    await resend.emails.send({
      from: "Mendoza Quotes <notifications@resend.dev>",
      to: [env.TO_EMAIL],
      subject,
      html,
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ ok: false }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" } as const)[
      c as "&" | "<" | ">" | '"' | "'"
    ]!
  );
}