import React, { forwardRef } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const statusColors = {
  draft: "bg-gray-100 text-gray-700",
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
  cancelled: "bg-gray-200 text-gray-500",
};

const formatTime = (hours, minutes) => {
  const h = parseInt(hours) || 0;
  const m = parseInt(minutes) || 0;
  if (h === 0 && m === 0) return "0h";
  if (m === 0) return `${h}h`;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
};

const PaymentIcon = ({ type }) => {
  const icons = {
    wise: (
      <svg viewBox="0 0 512 512" className="w-6 h-6">
        <rect width="512" height="512" rx="15%" fill="#9fe870" />
        <path
          fill="#163300"
          d="M128 192l64 128 48-80 48 80 64-128h-48l-16 32-48-80-48 80-16-32z"
        />
      </svg>
    ),
    paypal: (
      <svg viewBox="0 0 512 512" className="w-6 h-6">
        <rect width="512" height="512" rx="15%" fill="#002f86" />
        <path
          fill="#fff"
          d="M362 137c17 20 21 47 15 79-17 91-79 119-163 119h-21c-10 0-18 7-20 17l-27 127c-1 6-6 10-12 10h-49c-7 0-12-6-11-13l53-300c2-10 11-17 21-17h109c38 0 69 8 89 28"
        />
        <path
          fill="#009cde"
          d="M390 137c17 20 21 47 15 79-17 91-79 119-163 119h-21c-10 0-18 7-20 17l-27 127c-1 6-6 10-12 10h-49c-7 0-12-6-11-13l13-73c1-6 6-10 12-10h36c84 0 146-28 163-119 6-32 2-59-15-79"
        />
      </svg>
    ),
    wire_transfer: (
      <svg
        viewBox="0 0 24 24"
        className="w-6 h-6"
        fill="none"
        stroke="#4B5563"
        strokeWidth="2"
      >
        <rect x="3" y="8" width="18" height="12" rx="1" />
        <path d="M7 8V6a2 2 0 012-2h6a2 2 0 012 2v2" />
        <path d="M12 12v4" />
        <circle cx="12" cy="14" r="2" />
      </svg>
    ),
    other: (
      <svg
        viewBox="0 0 24 24"
        className="w-6 h-6"
        fill="none"
        stroke="#4B5563"
        strokeWidth="2"
      >
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
  };
  return icons[type] || icons.other;
};

const InvoicePreview = forwardRef(({ invoice }, ref) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return format(new Date(dateStr), "MMM dd, yyyy");
  };

  const formatCurrency = (amount) => {
    return `$${(parseFloat(amount) || 0).toFixed(2)}`;
  };

  const variant = invoice.invoice_style || "classic";

  return (
    <div
      ref={ref}
      className={`bg-white p-6 md:p-10 max-w-3xl mx-auto shadow-lg rounded-lg ${
        variant === "compact" ? "text-sm" : ""
      }`}
      style={{ width: "210mm", minHeight: "297mm", margin: "0 auto" }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <Badge
            className={`text-sm px-3 py-1 mb-4 ${
              statusColors[invoice.status || "draft"]
            }`}
          >
            {(invoice.status || "draft").toUpperCase()}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-green-500 mb-4">
            Invoice
          </h1>
          <p className="text-gray-500 font-medium text-lg">
            {invoice.invoice_number}
          </p>
        </div>
        <div className="text-right">
          <div className="space-y-1">
            <p className="text-gray-600 font-medium">Submitted on</p>
            <p className="text-green-500 font-medium">
              {formatDate(invoice.submitted_date)}
            </p>
          </div>
          {invoice.date_range_start && invoice.date_range_end && (
            <div className="mt-4">
              <p className="text-gray-600 font-medium">Billing Period:</p>
              <p className="text-gray-900">
                {formatDate(invoice.date_range_start)} -{" "}
                {formatDate(invoice.date_range_end)}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <p className="text-gray-600 font-medium">Invoice for:</p>
        <p className="text-gray-900 text-lg font-semibold">
          {invoice.client_name || "Client Name"}
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-6"></div>

      {/* Line Items Table */}
      <div className="mb-6">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 text-gray-600 font-semibold">
                Description
              </th>
              <th className="text-center py-3 text-gray-600 font-semibold w-24">
                Time
              </th>
              <th className="text-center py-3 text-gray-600 font-semibold w-24">
                Rate/Hr
              </th>
              <th className="text-right py-3 text-gray-600 font-semibold w-24">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {(invoice.line_items || []).map((item, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-4">
                  <div
                    className={`${
                      variant === "compact" ? "bg-white" : "bg-gray-100"
                    } px-3 py-2 rounded inline-block`}
                  >
                    {item.description}
                  </div>
                  {item.link && (
                    <div className="mt-2 text-sm">
                      <span className="text-gray-600">
                        {item.link_label || "Link"}:
                      </span>{" "}
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {item.link}
                      </a>
                    </div>
                  )}
                  {item.note && (
                    <div className="mt-2 text-sm text-gray-500 italic">
                      {item.note}
                    </div>
                  )}
                </td>
                <td className="py-4 text-center text-gray-700">
                  {formatTime(item.hours, item.minutes)}
                </td>
                <td className="py-4 text-center text-gray-700">
                  {formatCurrency(item.rate)}
                </td>
                <td className="py-4 text-right text-gray-900 font-medium">
                  {formatCurrency(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Subtotal & Adjustments */}
      <div className="flex justify-end mb-6">
        <div className="w-64">
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold text-gray-900">
              {formatCurrency(invoice.subtotal)}
            </span>
          </div>
          {(invoice.adjustments || []).length > 0 && (
            <>
              <div className="text-right text-gray-500 text-sm mb-2">
                Adjustments
              </div>
              {invoice.adjustments.map((adj, index) => (
                <div
                  key={index}
                  className="flex justify-between py-1 bg-gray-100 px-3 rounded mb-1"
                >
                  <span className="text-gray-600 text-sm">
                    {adj.description}
                  </span>
                  <span className="text-gray-900">
                    {formatCurrency(adj.amount)}
                  </span>
                </div>
              ))}
            </>
          )}
          <div className="flex justify-between py-3 border-t-2 border-gray-300 mt-2">
            <span className="text-gray-800 font-semibold">Total</span>
            <span className="font-bold text-xl text-gray-900">
              {formatCurrency(invoice.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-6"></div>

      {/* Payment Details */}
      {(invoice.payment_details || []).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Payment Methods
          </h3>
          <div className="grid gap-3">
            {invoice.payment_details.map((detail, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0 mt-1">
                  <PaymentIcon type={detail.type} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-gray-700 font-semibold">
                      {detail.label}:
                    </span>
                    {detail.is_link ? (
                      <a
                        href={detail.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {detail.value}
                      </a>
                    ) : (
                      <span className="text-gray-900 font-medium break-all">
                        {detail.value}
                      </span>
                    )}
                  </div>
                  {detail.qr_code_url && (
                    <div className="flex items-center gap-2">
                      <img
                        src={detail.qr_code_url}
                        alt="QR Code"
                        className="w-16 h-16 border rounded-lg object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {invoice.notes && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-sm">{invoice.notes}</p>
        </div>
      )}
    </div>
  );
});

InvoicePreview.displayName = "InvoicePreview";

export default InvoicePreview;
