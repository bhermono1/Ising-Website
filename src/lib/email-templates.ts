import { BUSINESS } from "@/lib/constants";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

// User-controlled strings (names, room names set via admin form, etc.) are
// interpolated directly into raw HTML email markup, so they need escaping —
// React's auto-escaping doesn't apply outside of JSX/the browser DOM.
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const wrapper = (title: string, bodyHtml: string) => `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0b0a12;font-family:Helvetica,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b0a12;padding:32px 0;">
      <tr>
        <td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background:#15131f;border-radius:16px;overflow:hidden;border:1px solid #2a2640;">
            <tr>
              <td style="padding:28px 32px;background:linear-gradient(135deg,#ff2d78,#7c3aed);">
                <span style="font-size:20px;font-weight:700;color:#fff;letter-spacing:0.5px;">${BUSINESS.name}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:#e8e6f0;">
                <h1 style="font-size:20px;margin:0 0 16px;color:#fff;">${title}</h1>
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:#0f0d18;color:#8b87a0;font-size:12px;">
                ${BUSINESS.address} · ${BUSINESS.phone}<br/>
                ${BUSINESS.name} — ${BUSINESS.tagline}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

const row = (label: string, value: string) => `
  <tr>
    <td style="padding:6px 0;color:#8b87a0;font-size:14px;">${label}</td>
    <td style="padding:6px 0;color:#fff;font-size:14px;text-align:right;font-weight:600;">${value}</td>
  </tr>
`;

export function reservationConfirmationEmail(params: {
  customerName: string;
  roomName: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  guestCount: number;
  depositAmount: number;
  totalAmount: number;
  reservationId: string;
}) {
  const body = `
    <p style="color:#c7c4d6;font-size:15px;">Hi ${escapeHtml(params.customerName)}, your karaoke room is booked. See you soon!</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-top:1px solid #2a2640;border-bottom:1px solid #2a2640;padding:8px 0;">
      ${row("Room", escapeHtml(params.roomName))}
      ${row("Date", formatDate(params.date))}
      ${row("Time", `${formatTime(params.startTime)} – ${formatTime(params.endTime)}`)}
      ${row("Guests", String(params.guestCount))}
      ${row("Deposit paid", formatCurrency(params.depositAmount))}
      ${row("Estimated total", formatCurrency(params.totalAmount))}
    </table>
    <p style="color:#8b87a0;font-size:13px;">Reservation ID: ${params.reservationId}</p>
    <p style="color:#c7c4d6;font-size:15px;">You can view or cancel this reservation anytime from your dashboard.</p>
  `;
  return wrapper("Your booking is confirmed 🎤", body);
}

export function reservationCancelledEmail(params: {
  customerName: string;
  roomName: string;
  date: Date;
  refundAmount: number;
}) {
  const body = `
    <p style="color:#c7c4d6;font-size:15px;">Hi ${escapeHtml(params.customerName)}, your reservation for <strong>${escapeHtml(params.roomName)}</strong> on ${formatDate(params.date)} has been cancelled.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-top:1px solid #2a2640;border-bottom:1px solid #2a2640;padding:8px 0;">
      ${row("Refund amount", formatCurrency(params.refundAmount))}
    </table>
    <p style="color:#c7c4d6;font-size:15px;">We hope to see you another time.</p>
  `;
  return wrapper("Reservation cancelled", body);
}

export function orderConfirmationEmail(params: {
  customerName: string;
  orderId: string;
  items: { name: string; quantity: number; unitPrice: number }[];
  totalAmount: number;
}) {
  const itemRows = params.items
    .map((i) => row(`${i.quantity} × ${escapeHtml(i.name)}`, formatCurrency(i.unitPrice * i.quantity)))
    .join("");
  const body = `
    <p style="color:#c7c4d6;font-size:15px;">Hi ${escapeHtml(params.customerName)}, thanks for your order!</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-top:1px solid #2a2640;border-bottom:1px solid #2a2640;padding:8px 0;">
      ${itemRows}
      ${row("Total", formatCurrency(params.totalAmount))}
    </table>
    <p style="color:#8b87a0;font-size:13px;">Order ID: ${params.orderId}</p>
    <p style="color:#c7c4d6;font-size:15px;">The kitchen has received your order and is firing it up.</p>
  `;
  return wrapper("Order confirmed 🍢", body);
}

export function welcomeEmail(params: { customerName: string }) {
  const body = `
    <p style="color:#c7c4d6;font-size:15px;">Hi ${escapeHtml(params.customerName)}, welcome to ${BUSINESS.name}! Your account is ready — go book a room and start the show.</p>
  `;
  return wrapper(`Welcome to ${BUSINESS.name}`, body);
}
