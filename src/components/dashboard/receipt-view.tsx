import { BUSINESS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PrintButton } from "@/components/dashboard/print-button";

export type ReceiptLine = { label: string; quantity?: number; amount: number };

export function ReceiptView({
  title,
  receiptId,
  date,
  customerName,
  customerEmail,
  lines,
  total,
  footerNote,
}: {
  title: string;
  receiptId: string;
  date: Date | string;
  customerName: string;
  customerEmail: string;
  lines: ReceiptLine[];
  total: number;
  footerNote?: string;
}) {
  return (
    <div>
      <div className="mb-6 flex justify-end print:hidden">
        <PrintButton />
      </div>

      <div className="mx-auto max-w-xl rounded-2xl border border-border bg-white p-8 text-zinc-900 print:border-0 print:p-0">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-6">
          <div>
            <p className="font-display text-xl font-semibold">{BUSINESS.name}</p>
            <p className="text-xs text-zinc-500">{BUSINESS.address}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">{title}</p>
            <p className="text-xs text-zinc-500">#{receiptId.slice(-8).toUpperCase()}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-between text-sm">
          <div>
            <p className="text-zinc-500">Billed to</p>
            <p className="font-medium">{customerName}</p>
            <p className="text-zinc-500">{customerEmail}</p>
          </div>
          <div className="text-right">
            <p className="text-zinc-500">Date</p>
            <p className="font-medium">{formatDate(date)}</p>
          </div>
        </div>

        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-zinc-500">
              <th className="pb-2 font-medium">Description</th>
              <th className="pb-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {lines.map((line, i) => (
              <tr key={i}>
                <td className="py-2.5">
                  {line.quantity ? `${line.quantity}× ` : ""}
                  {line.label}
                </td>
                <td className="py-2.5 text-right">{formatCurrency(line.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-between border-t border-zinc-200 pt-4 text-base font-semibold">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>

        {footerNote && <p className="mt-6 text-xs text-zinc-500">{footerNote}</p>}

        <p className="mt-8 text-center text-xs text-zinc-400">Thank you for visiting {BUSINESS.name}.</p>
      </div>
    </div>
  );
}
