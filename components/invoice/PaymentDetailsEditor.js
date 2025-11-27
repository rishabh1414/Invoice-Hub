import React from "react";
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

const defaultMethod = {
  type: "wise",
  label: "Wise",
  value: "",
  is_link: true,
  qr_code_url: "",
};

export default function PaymentDetailsEditor({ methods, onChange }) {
  const addMethod = () => {
    onChange([...(methods || []), { ...defaultMethod }]);
  };

  const updateMethod = (index, field, value) => {
    const next = [...(methods || [])];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  };

  const removeMethod = (index) => {
    onChange((methods || []).filter((_, i) => i !== index));
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
          <div className="flex items-center justify-between gap-3">
            <div className="w-48">
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Type
              </label>
              <Select
                value={method.type}
                onValueChange={(v) => updateMethod(index, "type", v)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wise">Wise</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="wire_transfer">Wire Transfer</SelectItem>
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
                Label
              </label>
              <Input
                value={method.label}
                onChange={(e) => updateMethod(index, "label", e.target.value)}
                placeholder="e.g., Wise USD, PayPal, Bank Transfer"
                className="bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Value / Instructions
              </label>
              <Input
                value={method.value}
                onChange={(e) => updateMethod(index, "value", e.target.value)}
                placeholder="URL, account number, or note"
                className="bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
            <div className="flex items-center gap-2">
              <input
                id={`is-link-${index}`}
                type="checkbox"
                checked={Boolean(method.is_link)}
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
              </label>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                QR Code URL (optional)
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
          </div>
        </div>
      ))}
    </div>
  );
}
