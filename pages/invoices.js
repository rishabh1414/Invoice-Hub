import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  FileText,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import InvoicePreview from "@/components/invoice/InvoicePreview";

const statusColors = {
  draft: "bg-gray-100 text-gray-700 border-gray-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  paid: "bg-green-100 text-green-700 border-green-200",
  overdue: "bg-red-100 text-red-700 border-red-200",
  cancelled: "bg-gray-200 text-gray-500 border-gray-300",
};

const fetchProfile = async () => {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  if (res.status === 401) throw new Error("auth");
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
};

const fetchInvoices = async () => {
  const res = await fetch("/api/invoices", { credentials: "include" });
  if (res.status === 401) throw new Error("auth");
  if (!res.ok) throw new Error("Failed to load invoices");
  return res.json();
};

const updateInvoiceStatus = async ({ id, data }) => {
  const res = await fetch(`/api/invoices/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (res.status === 401) throw new Error("auth");
  if (!res.ok) throw new Error("Failed to update invoice");
  return res.json();
};

const deleteInvoice = async (id) => {
  const res = await fetch(`/api/invoices/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (res.status === 401) throw new Error("auth");
  if (!res.ok) throw new Error("Failed to delete invoice");
  return res.json();
};

export default function Invoices() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const { status: authStatus } = useQuery({
    queryKey: ["me"],
    queryFn: fetchProfile,
    retry: false,
    onError: () => router.replace("/login"),
  });

  const {
    data: invoices = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["invoices"],
    queryFn: fetchInvoices,
    retry: false,
    onError: (err) => {
      if (err.message === "auth") router.push("/login");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateInvoiceStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice updated!");
    },
    onError: (err) => {
      if (err.message === "auth") router.push("/login");
      else toast.error("Could not update invoice");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice deleted!");
    },
    onError: (err) => {
      if (err.message === "auth") router.push("/login");
      else toast.error("Could not delete invoice");
    },
  });

  if (authStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-gray-600 text-sm">Checking your session...</div>
      </div>
    );
  }

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      (inv.client_name?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (inv.invoice_number?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      );
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return format(new Date(dateStr), "MMM dd, yyyy");
  };

  const handleStatusChange = (invoiceId, newStatus) => {
    updateMutation.mutate({ id: invoiceId, data: { status: newStatus } });
  };

  const handleDelete = (invoiceId) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      deleteMutation.mutate(invoiceId);
    }
  };

  const handlePreview = (invoice) => {
    setSelectedInvoice(invoice);
    setPreviewOpen(true);
  };

  const handleDownload = (invoice) => {
    setSelectedInvoice(invoice);
    setPreviewOpen(true);
    setTimeout(() => {
      const dateStr = invoice.submitted_date
        ? format(new Date(invoice.submitted_date), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd");
      const fileName = `${invoice.invoice_number}_${dateStr}`;
      const previewEl = document.querySelector("[data-invoice-preview]");
      if (previewEl) {
        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
          <html>
            <head>
              <title>${fileName}</title>
              <style>
                @page { size: A4; margin: 20mm; }
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; width: 210mm; min-height: 297mm; background: white; }
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
                img { max-width: 100%; height: auto; object-fit: contain; }
                @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
              </style>
            </head>
            <body>${previewEl.innerHTML}</body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }, 300);
  };

  const stats = {
    total: invoices.length,
    paid: invoices.filter((i) => i.status === "paid").length,
    pending: invoices.filter((i) => i.status === "pending").length,
    totalAmount: invoices.reduce((sum, i) => sum + (i.total || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
              Invoices
            </h1>
            <p className="text-gray-600 text-base">
              Manage and track all your invoices
            </p>
          </div>
          <Link href="/create-invoice">
            <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-5 shadow-sm">
              <Plus className="w-5 h-5 mr-2" />
              New Invoice
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="bg-white shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6 pt-4">
              <p className="text-sm font-medium text-gray-500 mb-2">
                Total Invoices
              </p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6 pt-4">
              <p className="text-sm font-medium text-gray-500 mb-2">Paid</p>
              <p className="text-3xl font-bold text-green-600">{stats.paid}</p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6 pt-4">
              <p className="text-sm font-medium text-gray-500 mb-2">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">
                {stats.pending}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6 pt-4">
              <p className="text-sm font-medium text-gray-500 mb-2">
                Total Amount
              </p>
              <p className="text-3xl font-bold text-gray-900">
                ${stats.totalAmount.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="shadow-sm border border-slate-200">
          <CardContent className="p-4 pt-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search by client or invoice number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 h-11 text-base"
                />
              </div>
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-gray-400" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-44 h-11">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Table */}
        <Card className="shadow-sm overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-slate-200">
                  <TableHead className="font-semibold text-gray-700 py-4">
                    Invoice #
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">
                    Client
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">
                    Date
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">
                    Amount
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">
                    Status
                  </TableHead>
                  <TableHead className="text-right font-semibold text-gray-700 py-4">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading || isFetching ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-16 text-gray-500"
                    >
                      Loading invoices...
                    </TableCell>
                  </TableRow>
                ) : filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-base mb-3">
                        No invoices found
                      </p>
                      <Link href="/create-invoice">
                        <Button variant="link" className="text-green-600">
                          Create your first invoice
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow
                      key={invoice._id}
                      className="hover:bg-gray-50 transition-colors border-b border-slate-100"
                    >
                      <TableCell className="font-medium text-gray-900 py-5">
                        {invoice.invoice_number || "-"}
                      </TableCell>
                      <TableCell className="text-gray-700 py-5">
                        {invoice.client_name || "-"}
                      </TableCell>
                      <TableCell className="text-gray-600 py-5">
                        {formatDate(invoice.submitted_date)}
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900 py-5">
                        ${(invoice.total || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="py-5">
                        <Select
                          value={invoice.status || "draft"}
                          onValueChange={(v) =>
                            handleStatusChange(invoice._id, v)
                          }
                        >
                          <SelectTrigger
                            className={`w-36 border ${
                              statusColors[invoice.status || "draft"]
                            }`}
                          >
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
                      </TableCell>
                      <TableCell className="text-right py-5">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePreview(invoice)}
                            className="text-blue-600 hover:bg-blue-50 h-9 w-9"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownload(invoice)}
                            className="text-green-600 hover:bg-green-50 h-9 w-9"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(invoice._id)}
                            className="text-red-500 hover:bg-red-50 h-9 w-9"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Preview Dialog */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl">Invoice Preview</DialogTitle>
            </DialogHeader>
            {selectedInvoice && (
              <div data-invoice-preview className="mt-2">
                <InvoicePreview invoice={selectedInvoice} />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
