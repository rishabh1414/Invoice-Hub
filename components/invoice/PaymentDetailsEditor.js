import React, { useMemo, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

const typeConfigs = {
  wise: {
    defaultLabel: "Wise",
    valueLabel: "Wise link / email",
    placeholder: "https://wise.com/ or email",
    defaultIsLink: true,
    helper: "Share your Wise link or email associated with your Wise account.",
  },
  paypal: {
    defaultLabel: "PayPal",
    valueLabel: "PayPal.me link / email",
    placeholder: "https://paypal.me/username or user@example.com",
    defaultIsLink: true,
    helper: "Use a PayPal.me link or the email that receives PayPal payments.",
  },
  wire_transfer: {
    defaultLabel: "Bank Name",
    valueLabel: "Account / IBAN",
    placeholder: "Account number or IBAN",
    defaultIsLink: false,
    helper: "Add bank details below; link option is disabled for wires.",
  },
  other: {
    defaultLabel: "Payment Method",
    valueLabel: "Instructions",
    placeholder: "Link or instructions",
    defaultIsLink: true,
    helper: "Share the details needed to pay you.",
  },
};

const getDefaultMethod = (type = "wise") => {
  const config = typeConfigs[type] || typeConfigs.other;
  return {
    type,
    label: config.defaultLabel,
    value: "",
    is_link: config.defaultIsLink,
    qr_code_url: "",
    qr_code_data: "",
    bank_name: "",
    account_number: "",
    swift_code: "",
    routing_number: "",
  };
};

export default function PaymentDetailsEditor({ methods, onChange }) {
  const fileInputsRef = useRef({});
  const typeMeta = useMemo(() => typeConfigs, []);

  const updateMethods = (updater) => {
    if (typeof onChange === "function") {
      onChange((prev) => {
        const base = Array.isArray(prev) ? prev : [];
        return updater([...base]);
      });
    }
  };

  const addMethod = () => {
    const hasIncomplete = (methods || []).some(
      (m) => !m.label?.trim() || !m.value?.trim()
    );
    if (hasIncomplete) {
      toast.error("Finish the current payment method before adding another.");
      return;
    }
    updateMethods((prev) => [...prev, getDefaultMethod()]);
  };

  const updateMethod = (index, field, value) => {
    updateMethods((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const mergeMethod = (index, payload) => {
    updateMethods((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...payload };
      return next;
    });
  };

  const removeMethod = (index) => {
    updateMethods((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadClick = (index) => {
    if (fileInputsRef.current[index]) {
      fileInputsRef.current[index].click();
    }
  };

  const applyTypeDefaults = (index, type) => {
    const config = typeMeta[type] || typeMeta.other;
    const current = methods?.[index] || {};
    const currentType = current.type || "other";
    const prevDefaultLabel =
      typeMeta[currentType]?.defaultLabel || typeMeta.other.defaultLabel;
    const shouldReplaceLabel =
      !current.label || current.label === prevDefaultLabel;

    mergeMethod(index, {
      type,
      label: shouldReplaceLabel ? config.defaultLabel : current.label,
      is_link: config.defaultIsLink,
      bank_name: current.bank_name || "",
      account_number: current.account_number || "",
      swift_code: current.swift_code || "",
      routing_number: current.routing_number || "",
    });
  };

  const handleFileChange = (event, index) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file for the QR code.");
      return;
    }

    if (file.size > 1.5 * 1024 * 1024) {
      toast.error("QR code image is too large. Keep it under 1.5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      mergeMethod(index, { qr_code_data: reader.result, qr_code_url: "" });
      toast.success("QR code uploaded");
      event.target.value = "";
    };
    reader.onerror = () => {
      toast.error("Failed to read the QR code file.");
      event.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const clearQrCode = (index) => {
    updateMethod(index, "qr_code_data", "");
    updateMethod(index, "qr_code_url", "");
    toast.info("QR code removed");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-md font-semibold text-gray-800">
          Payment Methods
        </h4>
        <Button
          type="button"
          onClick={addMethod}
          variant="outline"
          size="sm"
          className="text-green-600 border-green-600 hover:bg-green-50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Method
        </Button>
      </div>

      {(!methods || methods.length === 0) && (
        <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <p className="text-gray-500">Add at least one way to pay you.</p>
        </div>
      )}

      {methods?.map((method, index) => (
        <div
          key={index}
          className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3"
        >
          {(() => {
            const config = typeMeta[method.type] || typeMeta.other;
            return (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div className="w-48">
                    <label className="text-xs font-medium text-gray-500 mb-1 block">
                      Type
                    </label>
                    <Select
                      value={method.type || "other"}
                      onValueChange={(v) => applyTypeDefaults(index, v)}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wise">Wise</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="wire_transfer">
                          Wire Transfer
                        </SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    onClick={() => removeMethod(index)}
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:bg-red-50 mt-5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">
                      {config.defaultLabel}
                    </label>
                    <Input
                      value={method.label || ""}
                      onChange={(e) =>
                        updateMethod(index, "label", e.target.value)
                      }
                      placeholder={config.defaultLabel}
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">
                      {config.valueLabel}
                    </label>
                    <Input
                      value={method.value || ""}
                      onChange={(e) =>
                        updateMethod(index, "value", e.target.value)
                      }
                      placeholder={config.placeholder}
                      className="bg-white"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      {config.helper}
                    </p>
                  </div>
                </div>

                {method.type === "wire_transfer" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">
                        Bank Name
                      </label>
                      <Input
                        value={method.bank_name || ""}
                        onChange={(e) =>
                          updateMethod(index, "bank_name", e.target.value)
                        }
                        placeholder="Bank name"
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">
                        Account / IBAN
                      </label>
                      <Input
                        value={method.account_number || ""}
                        onChange={(e) =>
                          updateMethod(index, "account_number", e.target.value)
                        }
                        placeholder="Account number or IBAN"
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">
                        SWIFT (optional)
                      </label>
                      <Input
                        value={method.swift_code || ""}
                        onChange={(e) =>
                          updateMethod(index, "swift_code", e.target.value)
                        }
                        placeholder="SWIFT code"
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">
                        Routing (optional)
                      </label>
                      <Input
                        value={method.routing_number || ""}
                        onChange={(e) =>
                          updateMethod(index, "routing_number", e.target.value)
                        }
                        placeholder="Routing number"
                        className="bg-white"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      id={`is-link-${index}`}
                      type="checkbox"
                      checked={Boolean(method.is_link)}
                      disabled={method.type === "wire_transfer"}
                      onChange={(e) =>
                        updateMethod(index, "is_link", e.target.checked)
                      }
                      className="w-4 h-4 accent-green-600"
                    />
                    <label
                      htmlFor={`is-link-${index}`}
                      className="text-sm text-gray-700"
                    >
                      Treat value as a link
                      {method.type === "wire_transfer" && (
                        <span className="ml-1 text-xs text-gray-500">
                          (disabled for wire transfers)
                        </span>
                      )}
                    </label>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500 mb-1 block">
                      QR Code
                    </label>
                    {method.qr_code_data || method.qr_code_url ? (
                      <div className="flex items-center gap-3 mt-1">
                        <img
                          src={method.qr_code_data || method.qr_code_url}
                          alt="QR Code preview"
                          className="w-16 h-16 rounded-md border object-contain bg-white"
                        />
                        <div className="space-y-1">
                          <p className="text-xs text-gray-600">
                            QR stored with this method.
                          </p>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => clearQrCode(index)}
                            className="text-red-500 hover:bg-red-50 h-8"
                          >
                            Remove QR
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-wrap gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            className="bg-white max-w-xs"
                            ref={(el) => {
                              fileInputsRef.current[index] = el;
                            }}
                            onChange={(e) => handleFileChange(e, index)}
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleUploadClick(index)}
                            className="border-green-600 text-green-700 hover:bg-green-50"
                          >
                            Upload QR
                          </Button>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 mb-1 block">
                            or paste an image URL
                          </label>
                          <Input
                            value={method.qr_code_url || ""}
                            onChange={(e) =>
                              updateMethod(index, "qr_code_url", e.target.value)
                            }
                            placeholder="https://example.com/qr.png"
                            className="bg-white"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      ))}
    </div>
  );
}
