import React, { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Save, Eye, FileText, Image, Settings } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import InvoicePreview from "@/components/invoice/InvoicePreview";
import LineItemEditor from "@/components/invoice/LineItemEditor";
import AdjustmentsEditor from "@/components/invoice/AdjustmentsEditor";
import PaymentSettingsModal from "@/components/invoice/PaymentSettingsModal";

const statusColors = {
  draft: "bg-gray-100 text-gray-700",
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
  cancelled: "bg-gray-200 text-gray-500",
};

const fetchNextInvoiceNumber = async () => {
  const res = await fetch("/api/invoice-counter/next", {
    credentials: "include",
  });
  if (res.status === 401) throw new Error("auth");
  if (!res.ok) throw new Error("Failed to fetch next invoice number");
  return res.json();
};

const fetchPaymentSettings = async () => {
  const res = await fetch("/api/payment-settings", { credentials: "include" });
  if (res.status === 401) throw new Error("auth");
  if (!res.ok) throw new Error("Failed to fetch payment settings");
  return res.json();
};

const fetchProfile = async () => {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  if (res.status === 401) throw new Error("auth");
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
};

const saveInvoice = async (payload) => {
  const res = await fetch("/api/invoices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (res.status === 401) throw new Error("auth");
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "Failed to save invoice");
  }
  return res.json();
};

export default function CreateInvoice() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const invoiceRef = useRef(null);
  const [activeTab, setActiveTab] = useState("edit");
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");

  const { data: profile, status: authStatus } = useQuery({
    queryKey: ["me"],
    queryFn: fetchProfile,
    retry: false,
    onError: (err) => {
      if (err.message === "auth") router.push("/login");
    },
  });

  const { data: counterData } = useQuery({
    queryKey: ["invoiceCounter"],
    queryFn: fetchNextInvoiceNumber,
    retry: false,
    onError: (err) => {
      if (err.message === "auth") router.push("/login");
    },
  });

  const { data: paymentSettings } = useQuery({
    queryKey: ["paymentSettings"],
    queryFn: fetchPaymentSettings,
    retry: false,
    onError: (err) => {
      if (err.message === "auth") router.push("/login");
    },
  });

  useEffect(() => {
    if (counterData?.next_invoice_number) {
      setInvoiceNumber(counterData.next_invoice_number);
    }
  }, [counterData]);

  const [invoice, setInvoice] = useState({
    invoice_number: "",
    client_name: "",
    submitted_date: format(new Date(), "yyyy-MM-dd"),
    date_range_start: "",
    date_range_end: "",
    line_items: [],
    adjustments: [],
    subtotal: 0,
    total: 0,
    payment_details: [],
    status: "draft",
    notes: "",
    invoice_style: "classic",
  });

  useEffect(() => {
    if (invoiceNumber) {
      setInvoice((prev) => ({ ...prev, invoice_number: invoiceNumber }));
    }
  }, [invoiceNumber]);

  useEffect(() => {
    if (paymentSettings?.payment_methods) {
      setInvoice((prev) => ({
        ...prev,
        payment_details: paymentSettings.payment_methods,
      }));
    }
  }, [paymentSettings]);

  useEffect(() => {
    if (profile?.invoice_template) {
      setInvoice((prev) => ({
        ...prev,
        invoice_style: profile.invoice_template,
      }));
    }
  }, [profile]);

  useEffect(() => {
    const subtotal = invoice.line_items.reduce(
      (sum, item) => sum + (parseFloat(item.total) || 0),
      0
    );
    const adjustmentsTotal = invoice.adjustments.reduce(
      (sum, adj) => sum + (parseFloat(adj.amount) || 0),
      0
    );
    const total = subtotal + adjustmentsTotal;

    setInvoice((prev) => ({ ...prev, subtotal, total }));
  }, [invoice.line_items, invoice.adjustments]);

  const updateField = (field, value) => {
    setInvoice((prev) => ({ ...prev, [field]: value }));
  };

  const saveMutation = useMutation({
    mutationFn: (data) => saveInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoiceCounter"] });
      toast.success("Invoice saved successfully!");
      router.push("/invoices");
    },
    onError: (error) => {
      if (error.message === "auth") router.push("/login");
      else toast.error(error?.message || "Failed to save invoice");
    },
  });

  if (authStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-gray-600 text-sm">Checking your session...</div>
      </div>
    );
  }

  const handleSave = () => {
    if (!invoice.client_name) {
      toast.error("Please enter a client name");
      return;
    }
    saveMutation.mutate(invoice);
  };

  const getFileName = () => {
    const dateStr = format(
      new Date(invoice.submitted_date || new Date()),
      "yyyy-MM-dd"
    );
    return `${invoice.invoice_number || "invoice"}_${dateStr}`;
  };

  const downloadAsPDF = () => {
    setActiveTab("preview");
    setTimeout(() => {
      const printContents = invoiceRef.current?.innerHTML;
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>${getFileName()}</title>
            <style>
              @page { size: A4; margin: 20mm; }
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                padding: 40px;
                width: 210mm;
                min-height: 297mm;
                background: white;
              }
              .text-green-500 { color: #22c55e; }
              .text-blue-600 { color: #2563eb; }
              .text-gray-900 { color: #111827; }
              .text-gray-600 { color: #4b5563; }
              .text-gray-500 { color: #6b7211; }
              .font-bold { font-weight: 700; }
              .font-semibold { font-weight: 600; }
              .font-medium { font-weight: 500; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { padding: 16px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
              th { font-weight: 600; color: #4b5563; background: #f9fafb; }
              a { color: #2563eb; text-decoration: none; }
              .bg-gray-100 { background: #f3f4f6; padding: 10px 14px; border-radius: 6px; display: inline-block; }
              .bg-green-100 { background: #dcfce7; color: #15803d; padding: 6px 16px; border-radius: 6px; font-weight: 600; }
              .bg-yellow-100 { background: #fef3c7; color: #b45309; padding: 6px 16px; border-radius: 6px; font-weight: 600; }
              .bg-red-100 { background: #fee2e2; color: #dc2626; padding: 6px 16px; border-radius: 6px; font-weight: 600; }
              .space-y-1 > * + * { margin-top: 4px; }
              .space-y-3 > * + * { margin-top: 12px; }
              .mb-4 { margin-bottom: 16px; }
              .mb-6 { margin-bottom: 24px; }
              .mb-8 { margin-bottom: 32px; }
              .mt-4 { margin-top: 16px; }
              .mt-6 { margin-top: 24px; }
              .my-6 { margin-top: 24px; margin-bottom: 24px; }
              .py-2 { padding-top: 8px; padding-bottom: 8px; }
              .py-3 { padding-top: 12px; padding-bottom: 12px; }
              .border-t { border-top: 1px solid #e5e7eb; }
              .border-t-2 { border-top: 2px solid #d1d5db; }
              h1 { font-size: 48px; margin-bottom: 16px; }
              img { max-width: 80px; max-height: 80px; object-fit: contain; }
              @media print { 
                body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } 
                @page { margin: 15mm; }
              }
            </style>
          </head>
          <body>${printContents}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }, 100);
    toast.success("Print dialog opened - Save as PDF");
  };

  const downloadAsPNG = () => {
    setActiveTab("preview");
    setTimeout(async () => {
      try {
        const { default: html2canvas } = await import("html2canvas");
        const canvas = await html2canvas(invoiceRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        });
        const link = document.createElement("a");
        link.download = `${getFileName()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        toast.success("PNG downloaded!");
      } catch (error) {
        window.print();
        toast.info("Use your browser print dialog to save as image");
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Create Invoice
              </h1>
              <p className="text-gray-500 mt-1">
                Build your invoice and download as PDF or PNG
              </p>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <Badge
                className={`text-sm px-3 py-1 ${statusColors[invoice.status]}`}
              >
                {invoice.status.toUpperCase()}
              </Badge>
              <Button
                onClick={() => setPaymentModalOpen(true)}
                variant="outline"
                className="border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <Settings className="w-4 h-4 mr-2" />
                Payment Settings
              </Button>
              <Button
                onClick={downloadAsPNG}
                variant="outline"
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <Image className="w-4 h-4 mr-2" />
                PNG
              </Button>
              <Button
                onClick={downloadAsPDF}
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {saveMutation.isPending ? "Saving..." : "Save Invoice"}
              </Button>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-green-700 font-semibold">
                Total
              </p>
              <p className="text-2xl font-bold text-green-800 mt-1">
                ${invoice.total.toFixed(2)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                Subtotal
              </p>
              <p className="text-xl font-semibold text-gray-900 mt-1">
                ${invoice.subtotal.toFixed(2)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                Adjustments
              </p>
              <p className="text-xl font-semibold text-gray-900 mt-1">
                $
                {invoice.adjustments
                  .reduce((sum, adj) => sum + (parseFloat(adj.amount) || 0), 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 bg-white shadow-sm flex flex-wrap gap-2 p-2 rounded-lg border border-slate-200">
            <TabsTrigger
              value="edit"
              className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700"
            >
              Edit Invoice
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-1 block">
                        Invoice Number
                      </label>
                      <Input
                        value={invoice.invoice_number}
                        readOnly
                        disabled
                        className="bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-1 block">
                        Status
                      </label>
                      <Select
                        value={invoice.status}
                        onValueChange={(v) => updateField("status", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-1 block">
                      Client Name
                    </label>
                    <Input
                      value={invoice.client_name}
                      onChange={(e) =>
                        updateField("client_name", e.target.value)
                      }
                      placeholder="Enter client name"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-1 block">
                        Submitted Date
                      </label>
                      <Input
                        type="date"
                        value={invoice.submitted_date}
                        onChange={(e) =>
                          updateField("submitted_date", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-1 block">
                        Invoice Style
                      </label>
                      <Select
                        value={invoice.invoice_style}
                        onValueChange={(v) => updateField("invoice_style", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="classic">Classic</SelectItem>
                          <SelectItem value="compact">Compact</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Billing Period</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-1 block">
                        Start Date
                      </label>
                      <Input
                        type="date"
                        value={invoice.date_range_start}
                        onChange={(e) =>
                          updateField("date_range_start", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-1 block">
                        End Date
                      </label>
                      <Input
                        type="date"
                        value={invoice.date_range_end}
                        onChange={(e) =>
                          updateField("date_range_end", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-1 block">
                      Notes
                    </label>
                    <Textarea
                      value={invoice.notes}
                      onChange={(e) => updateField("notes", e.target.value)}
                      placeholder="Additional notes..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6 mt-10 mb-10">
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Task List</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <LineItemEditor
                    items={invoice.line_items}
                    onChange={(items) => updateField("line_items", items)}
                  />
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Adjustments</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <AdjustmentsEditor
                    adjustments={invoice.adjustments}
                    onChange={(adj) => updateField("adjustments", adj)}
                  />
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-sm bg-gradient-to-r from-green-50 to-emerald-50">
              <CardContent className="pt-6">
                <div className="flex justify-end">
                  <div className="w-full sm:w-72 space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal:</span>
                      <span className="font-medium">
                        ${invoice.subtotal.toFixed(2)}
                      </span>
                    </div>
                    {invoice.adjustments.length > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>Adjustments:</span>
                        <span className="font-medium">
                          $
                          {invoice.adjustments
                            .reduce(
                              (sum, adj) => sum + (parseFloat(adj.amount) || 0),
                              0
                            )
                            .toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl font-bold text-green-700 pt-2 border-t border-green-200">
                      <span>Total:</span>
                      <span>${invoice.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <InvoicePreview ref={invoiceRef} invoice={invoice} />
          </TabsContent>
        </Tabs>

        <PaymentSettingsModal
          open={paymentModalOpen}
          onOpenChange={setPaymentModalOpen}
        />
      </div>
    </div>
  );
}
