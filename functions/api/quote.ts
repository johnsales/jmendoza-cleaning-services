// functions/api/quote.ts
// No imports needed. We call Resend's REST API via fetch.

export const onRequestPost = async (ctx: any): Promise<Response> => {
  const { request, env } = ctx;

  try {
    const data = await request.json();

    const lang = data?.lang === "es" ? "es" : "en";
    const quote = data?.quote ?? {};
    const booking = data?.booking ?? null;

    const extras = quote.extras ?? {};
    const extrasList =
      Object.entries(extras)
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join(", ") || (lang === "es" ? "Ninguno" : "None");

    const subject =
      lang === "es"
        ? `Nueva cotización de limpieza - ${booking?.name ?? "Cliente"}`
        : `New cleaning quote - ${booking?.name ?? "Customer"}`;

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif">
        <h2>Mendoza Cleaning Services</h2>
        <h3>${lang === "es" ? "Cotización" : "Quote"}</h3>
        <ul>
          <li>Sqft: ${quote.sqft}</li>
          <li>Bedrooms: ${quote.bedrooms}</li>
          <li>Bathrooms: ${quote.bathrooms}</li>
          <li>Extras: ${extrasList}</li>
          <li><b>Total:</b> $${Number(quote.total ?? 0).toFixed(2)}</li>
        </ul>
        ${
          booking
            ? `<h3>${lang === "es" ? "Reserva" : "Booking details"}</h3>
               <ul>
                 <li>Name: ${escapeHtml(booking.name ?? "")}</li>
                 <li>Email: ${escapeHtml(booking.email ?? "")}</li>
                 <li>Phone: ${escapeHtml(booking.phone ?? "")}</li>
                 <li>Address: ${escapeHtml(booking.address ?? "")}</li>
                 <li>Date: ${escapeHtml(booking.date ?? "")}</li>
                 <li>Notes: ${escapeHtml(booking.notes ?? "")}</li>
               </ul>`
            : `<p>${lang === "es" ? "(Sin datos de reserva)" : "(No booking info submitted)"}</p>`
        }
      </div>
    `;

    // Send email via Resend REST API
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`, // set in Pages > Settings > Environment variables
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // If you don't have a verified domain yet, use 'onboarding@resend.dev'
        from: "Mendoza Quotes <onboarding@resend.dev>",
        to: [env.TO_EMAIL], // e.g. jmsvsmorone@gmail.com
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return new Response(JSON.stringify({ ok: false, error: text }), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: String(err?.message ?? err) }), {
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