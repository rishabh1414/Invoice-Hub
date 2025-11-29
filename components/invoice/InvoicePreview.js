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

const PaymentIcon = ({ type, size = 40 }) => {
  const icons = {
    wise: (
      <svg
        viewBox="0 0 88 20"
        width={size}
        height={size * (20 / 88)}
        role="img"
        aria-label="Wise logo"
      >
        <path
          fill="#ffffff"
          d="M48.9285.2989h5.413L51.6183 19.7263h-5.4131L48.9285.2989Zm-6.8241 0L38.4514 11.4904 36.8573.2989h-3.7858L28.2893 11.4572 27.6917.2989h-5.2472L24.271 19.7263h4.3504L34.0014 7.4389 35.8943 19.7263h4.284L47.2518.2989h-5.1474ZM87.5508 11.59H74.6988c.0665 2.5239 1.5775 4.1844 3.8025 4.1844 1.6771 0 3.0055-.8967 4.035-2.607l4.3382 1.972C85.3833 18.0775 82.2413 19.992 78.3685 19.992 73.0883 19.992 69.5847 16.4386 69.5847 10.7266 69.5847 4.4501 73.7025 0 79.5142 0c5.1145 0 8.3357 3.4538 8.3357 8.8336 0 .8967-.1 1.7933-.299 2.7564Zm-4.8153-3.7194c0-2.2582-1.262-3.6862-3.2877-3.6862-2.0922 0-3.8191 1.4944-4.2841 3.6862h7.5718ZM5.5255 6.1532 0 12.6107h9.8661l1.1086-3.0449H6.747l2.5832-2.9868.0083-.0792L7.6588 3.6085h7.5569l-5.8579 16.1179h4.0087L20.4402.2989H2.166L5.5255 6.1532Zm57.6165-1.9689c1.9095 0 3.5827 1.0269 5.0439 2.7869l.7677-5.4769C67.592.5729 65.7489 0 63.308 0c-4.8485 0-7.5716 2.8394-7.5716 6.4426 0 2.499 1.3948 4.0266 3.6862 5.0146l1.0959.4981c2.0423.8718 2.5904 1.3036 2.5904 2.2251 0 .9547-.9216 1.5608-2.3247 1.5608-2.3164.0083-4.1927-1.1789-5.6041-3.2047l-.7822 5.5803C56.0053 19.3423 58.0657 19.992 60.7842 19.992c4.6077 0 7.4389-2.6568 7.4389-6.343 0-2.5072-1.1125-4.1179-3.9188-5.3798l-1.1954-.5645c-1.6605-.7389-2.225-1.1457-2.225-1.9593 0-.88.7721-1.5609 2.2582-1.5609Z"
        />
      </svg>
    ),
    paypal: (
      <svg
        viewBox="0 0 512 512"
        width={size}
        height={size}
        role="img"
        aria-label="PayPal logo"
      >
        <rect width="512" height="512" rx="15%" fill="#003087" />
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
        width={size}
        height={size}
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
        width={size}
        height={size}
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

      {/* Notes */}
      {invoice.notes && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-sm">{invoice.notes}</p>
        </div>
      )}

      {/* Payment Details - footer */}
      {(invoice.payment_details || []).length > 0 && (
        <div className="mt-10 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Payment Methods
          </h3>
          <div className="grid gap-3">
            {invoice.payment_details.map((detail, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0 mt-1">
                  <div
                    className={`inline-flex items-center justify-center rounded-md px-3 py-2 ${
                      detail.type === "wise"
                        ? "bg-[#163300]"
                        : "bg-gray-100 border border-gray-200"
                    }`}
                  >
                    <PaymentIcon
                      type={detail.type}
                      size={detail.type === "wise" ? 88 : 42}
                    />
                  </div>
                </div>
                <div className="flex-1 space-y-2">
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
                  {detail.type === "wire_transfer" && (
                    <div className="text-sm text-gray-700 space-y-1">
                      {detail.bank_name && (
                        <div>
                          <span className="font-semibold">Bank:</span>{" "}
                          {detail.bank_name}
                        </div>
                      )}
                      {detail.account_number && (
                        <div>
                          <span className="font-semibold">Account / IBAN:</span>{" "}
                          {detail.account_number}
                        </div>
                      )}
                      {detail.swift_code && (
                        <div>
                          <span className="font-semibold">SWIFT:</span>{" "}
                          {detail.swift_code}
                        </div>
                      )}
                      {detail.routing_number && (
                        <div>
                          <span className="font-semibold">Routing:</span>{" "}
                          {detail.routing_number}
                        </div>
                      )}
                    </div>
                  )}
                  {(detail.qr_code_data || detail.qr_code_url) && (
                    <div className="flex items-center gap-2">
                      <img
                        src={detail.qr_code_data || detail.qr_code_url}
                        alt="QR Code"
                        className="border rounded-lg object-contain bg-white"
                        style={{ width: "120px", height: "120px" }}
                      />
                      <span className="text-xs text-gray-500">
                        Scan to pay
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

InvoicePreview.displayName = "InvoicePreview";

export default InvoicePreview;
