import { format } from "date-fns";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    return format(new Date(dateStr), "MMM dd, yyyy");
  } catch (e) {
    return dateStr;
  }
};

const formatTime = (hours, minutes) => {
  const h = Number(hours) || 0;
  const m = Number(minutes) || 0;
  if (h === 0 && m === 0) return "0h";
  if (m === 0) return `${h}h`;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
};

const formatMoney = (amount) => `$${(Number(amount) || 0).toFixed(2)}`;

const statusBadge = (status = "draft") => {
  const map = {
    draft: { fillColor: "#f8fafc", color: "#475569" },
    pending: { fillColor: "#fef9c3", color: "#92400e" },
    paid: { fillColor: "#ecfdf3", color: "#15803d" },
    overdue: { fillColor: "#fef2f2", color: "#b91c1c" },
    cancelled: { fillColor: "#f3f4f6", color: "#6b7280" },
  };
  return map[status] || map.draft;
};

const buildPaymentBlocks = (paymentDetails = []) =>
  (paymentDetails || []).map((detail) => {
    const icon =
      detail.type === "wise"
        ? {
            svg: `
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 24" role="img" aria-label="Wise">
                <rect x="0" y="2" width="88" height="20" rx="5" fill="#163300" />
                <text x="16" y="17" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#ffffff">WISE</text>
              </svg>
            `,
            width: 80,
            height: 24,
            margin: [0, 2, 10, 2],
          }
        : {
            canvas: [
              {
                type: "rect",
                x: 0,
                y: 0,
                w: 36,
                h: 24,
                r: 4,
                color: "#e2e8f0",
              },
            ],
            margin: [0, 0, 6, 0],
          };

    const bankLines =
      detail.type === "wire_transfer"
        ? [
            detail.bank_name && { text: `Bank: ${detail.bank_name}`, style: "body" },
            detail.account_number && {
              text: `Account / IBAN: ${detail.account_number}`,
              style: "body",
            },
            detail.swift_code && { text: `SWIFT: ${detail.swift_code}`, style: "body" },
            detail.routing_number && {
              text: `Routing: ${detail.routing_number}`,
              style: "body",
            },
          ].filter(Boolean)
        : [];

    return {
      table: {
        widths: ["auto", "*"],
        body: [
          [
            { ...icon, margin: [0, 0, 12, 0], alignment: "center" },
            {
              stack: [
                {
                  text: detail.label || "Payment Method",
                  style: "subtitle",
                  margin: [0, 0, 0, 2],
                },
                detail.value
                  ? {
                      text: detail.value,
                      style: "bodyBold",
                      color: detail.is_link !== false ? "#2563eb" : "#0f172a",
                      link: detail.is_link !== false ? detail.value : undefined,
                      margin: [0, 0, 0, 6],
                    }
                  : { text: "—", style: "body", margin: [0, 0, 0, 6] },
                ...bankLines,
                detail.qr_code_data || detail.qr_code_url
                  ? {
                      columns: [
                        {
                          image: detail.qr_code_data || detail.qr_code_url,
                          width: 70,
                          height: 70,
                          margin: [0, 6, 8, 0],
                        },
                        {
                          text: "Scan to pay",
                          style: "label",
                          margin: [0, 10, 0, 0],
                        },
                      ],
                      columnGap: 8,
                    }
                  : null,
              ].filter(Boolean),
            },
          ],
        ],
      },
      layout: "noBorders",
      fillColor: "#f9fafb",
      margin: [0, 6, 0, 6],
      border: [false, false, false, false],
    };
  });

const buildDocDefinition = (invoice) => {
  const status = statusBadge(invoice.status);
  const subtotal =
    typeof invoice.subtotal === "number"
      ? invoice.subtotal
      : (invoice.line_items || []).reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  const adjustmentsTotal = (invoice.adjustments || []).reduce(
    (sum, adj) => sum + (Number(adj.amount) || 0),
    0
  );
  const total = typeof invoice.total === "number" ? invoice.total : subtotal + adjustmentsTotal;

  const lineItemBlocks = (invoice.line_items || []).map((item, idx, arr) => [
    {
      table: {
        widths: ["*", 60, 60, 80],
        body: [
          [
            {
              stack: [
                { text: item.description || "—", style: "bodyBold" },
                item.note && { text: item.note, style: "label", italics: true },
                item.link && {
                  text: item.link_label || item.link,
                  style: "link",
                  link: item.link,
                },
              ].filter(Boolean),
            },
            {
              text: formatTime(item.hours, item.minutes),
              style: "body",
              alignment: "center",
            },
            { text: formatMoney(item.rate), style: "body", alignment: "center" },
            { text: formatMoney(item.total), style: "bodyBold", alignment: "right" },
          ],
        ],
      },
      layout: "noBorders",
      fillColor: "#f8fafc",
      margin: [0, 4, 0, 4],
      border: [false, false, false, false],
    },
    idx < arr.length - 1 && {
      canvas: [
        {
          type: "line",
          x1: 0,
          y1: 0,
          x2: 520,
          y2: 0,
          lineWidth: 0.5,
          lineColor: "#e5e7eb",
        },
      ],
      margin: [0, 6, 0, 6],
    },
  ]).flat().filter(Boolean);

  return {
    pageSize: "A4",
    pageMargins: [40, 48, 40, 60],
    content: [
      {
        columns: [
          {
            stack: [
              { text: (invoice.status || "draft").toUpperCase(), style: "badge", ...status },
              { text: "Invoice", style: "title" },
              invoice.invoice_number && {
                text: `#${invoice.invoice_number}`,
                style: "subtitle",
                margin: [0, -2, 0, 0],
              },
              { text: "Bill To", style: "label", margin: [0, 12, 0, 2] },
              { text: invoice.client_name || "Client", style: "bodyBold" },
            ].filter(Boolean),
            width: "*",
          },
          {
            stack: [
              { text: `Submitted: ${formatDate(invoice.submitted_date)}`, style: "label" },
              invoice.date_range_start &&
                invoice.date_range_end && {
                  text: `Period: ${formatDate(invoice.date_range_start)} - ${formatDate(
                    invoice.date_range_end
                  )}`,
                  style: "label",
                  margin: [0, 2, 0, 0],
                },
              { text: `Total: ${formatMoney(total)}`, style: "title", alignment: "right" },
            ].filter(Boolean),
            width: "auto",
            alignment: "right",
          },
        ],
        columnGap: 16,
        margin: [0, 0, 0, 8],
      },
      {
        stack: [
          { text: "Line Items", style: "sectionTitle", margin: [0, 0, 0, 6] },
          ...lineItemBlocks,
        ],
        margin: [0, 0, 0, 12],
      },
      {
        columns: [
          { width: "*", text: "" },
          {
            width: 200,
            table: {
              widths: ["*", "auto"],
              body: [
                [
                  { text: "Subtotal", style: "label" },
                  { text: formatMoney(subtotal), style: "bodyBold", alignment: "right" },
                ],
                ...(invoice.adjustments || []).map((adj) => [
                  { text: adj.description || "Adjustment", style: "label" },
                  { text: formatMoney(adj.amount), style: "bodyBold", alignment: "right" },
                ]),
                [
                  { text: "Total", style: "tableHeader" },
                  { text: formatMoney(total), style: "total", alignment: "right" },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 0.6,
              hLineColor: "#e5e7eb",
              vLineWidth: () => 0,
              paddingLeft: () => 6,
              paddingRight: () => 6,
              paddingTop: (i) => (i === 0 ? 8 : 4),
              paddingBottom: () => 6,
            },
          },
        ],
        margin: [0, 0, 0, 16],
      },
      invoice.notes && {
        stack: [
          { text: "Notes", style: "label", margin: [0, 0, 0, 4] },
          { text: invoice.notes, style: "body" },
        ],
        margin: [0, 0, 0, 16],
      },
      (invoice.payment_details || []).length > 0 && {
        stack: [
          { text: "Payment Methods", style: "subtitle", margin: [0, 0, 0, 6] },
          ...buildPaymentBlocks(invoice.payment_details),
        ],
        pageBreak: "before",
      },
    ].filter(Boolean),
    styles: {
      title: { fontSize: 22, bold: true, color: "#16a34a", margin: [0, 4, 0, 2] },
      subtitle: { fontSize: 12, bold: true, color: "#0f172a", margin: [0, 2, 0, 0] },
      label: { fontSize: 10, color: "#6b7280" },
      body: { fontSize: 10, color: "#0f172a" },
      bodyBold: { fontSize: 10, bold: true, color: "#0f172a" },
      sectionTitle: { fontSize: 12, bold: true, color: "#0f172a", letterSpacing: 0.2 },
      link: { fontSize: 10, color: "#2563eb", decoration: "underline" },
      tableHeader: {
        fontSize: 10,
        bold: true,
        color: "#475569",
        fillColor: "#f8fafc",
        margin: [0, 6, 0, 6],
      },
      badge: {
        fontSize: 9,
        bold: true,
        color: "#475569",
        fillColor: "#f8fafc",
        margin: [0, 0, 0, 8],
        padding: 4,
      },
      total: { fontSize: 14, bold: true, color: "#0f172a" },
    },
  };
};

export const generateInvoicePdf = async (invoice, fileName = "invoice") => {
  const pdfMakeModule = await import("pdfmake/build/pdfmake");
  const pdfFontsModule = await import("pdfmake/build/vfs_fonts");

  // pdfmake UMD can expose as default, named, or nested pdfMake
  const pdfMake =
    pdfMakeModule?.default?.createPdf
      ? pdfMakeModule.default
      : pdfMakeModule?.pdfMake?.createPdf
      ? pdfMakeModule.pdfMake
      : pdfMakeModule;

  // vfs export shapes differ; pdfmake provides a helper
  const fontModule = pdfFontsModule?.default || pdfFontsModule;

  if (!pdfMake?.createPdf || !fontModule) {
    throw new Error("Failed to load PDF generator assets");
  }

  if (typeof pdfMake.addVirtualFileSystem === "function") {
    pdfMake.addVirtualFileSystem(fontModule);
  } else if (
    fontModule?.pdfMake?.vfs ||
    fontModule?.vfs ||
    pdfFontsModule?.pdfMake?.vfs
  ) {
    pdfMake.vfs =
      fontModule?.pdfMake?.vfs ||
      fontModule?.vfs ||
      pdfFontsModule?.pdfMake?.vfs;
  } else {
    throw new Error("Failed to attach PDF fonts");
  }

  const doc = buildDocDefinition(invoice);
  pdfMake.createPdf(doc).download(`${fileName}.pdf`);
};

export default generateInvoicePdf;
