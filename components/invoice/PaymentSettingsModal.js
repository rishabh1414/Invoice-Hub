import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PaymentDetailsEditor from "./PaymentDetailsEditor";
import { toast } from "sonner";

const getDefaultMethod = (type = "wise") => {
  const defaults = {
    wise: { label: "Wise", is_link: true },
    paypal: { label: "PayPal", is_link: true },
    wire_transfer: { label: "Bank Name", is_link: false },
    other: { label: "Payment Method", is_link: true },
  }[type] || { label: "Payment Method", is_link: true };

  return {
    type,
    label: defaults.label,
    value: "",
    is_link: defaults.is_link,
    qr_code_url: "",
    qr_code_data: "",
    bank_name: "",
    account_number: "",
    swift_code: "",
    routing_number: "",
  };
};

const fetchSettings = async () => {
  const res = await fetch("/api/payment-settings", { credentials: "include" });
  if (!res.ok) {
    throw new Error("Failed to load payment settings");
  }
  return res.json();
};

const saveSettings = async (payment_methods) => {
  const res = await fetch("/api/payment-settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ payment_methods }),
  });
  if (!res.ok) {
    throw new Error("Failed to save payment settings");
  }
  return res.json();
};

export default function PaymentSettingsModal({ open, onOpenChange }) {
  const queryClient = useQueryClient();
  const [methods, setMethods] = useState([]);

  const { data: settings } = useQuery({
    queryKey: ["paymentSettings"],
    queryFn: fetchSettings,
    enabled: open,
    retry: false,
  });

  useEffect(() => {
    if (settings?.payment_methods?.length) {
      setMethods(
        settings.payment_methods.map((method) => ({
          ...getDefaultMethod(method.type || "other"),
          ...method,
          bank_name: method.bank_name || "",
          account_number: method.account_number || "",
          swift_code: method.swift_code || "",
          routing_number: method.routing_number || "",
        }))
      );
    } else {
      setMethods([getDefaultMethod("wise")]);
    }
  }, [settings, open]);

  const saveMutation = useMutation({
    mutationFn: (methodsPayload) => saveSettings(methodsPayload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentSettings"] });
      toast.success("Payment settings saved");
      onOpenChange(false);
    },
    onError: () => toast.error("Could not save payment settings"),
  });

  const handleSave = () => {
    const filtered = (methods || []).filter(
      (m) => (m.label && m.label.trim()) || (m.value && m.value.trim())
    );
    if (filtered.length === 0) {
      toast.error("Add at least one payment method");
      return;
    }
    const hasIncomplete = filtered.some(
      (m) => !m.label?.trim() || !m.value?.trim()
    );
    if (hasIncomplete) {
      toast.error("Each payment method needs a label and a value.");
      return;
    }
    saveMutation.mutate(filtered);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Payment Settings</DialogTitle>
          <DialogDescription>
            Configure how clients can pay you. These methods will appear on each
            invoice.
          </DialogDescription>
        </DialogHeader>

        <PaymentDetailsEditor methods={methods} onChange={setMethods} />

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {saveMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
