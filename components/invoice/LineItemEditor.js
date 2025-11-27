import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Link } from "lucide-react";

export default function LineItemEditor({ items, onChange }) {
  const addItem = () => {
    onChange([
      ...items,
      {
        description: "",
        hours: 0,
        minutes: 0,
        rate: 0,
        total: 0,
        link: "",
        link_label: "",
      },
    ]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Auto-calculate total when hours, minutes, or rate changes
    if (field === "hours" || field === "minutes" || field === "rate") {
      const hours =
        field === "hours"
          ? parseFloat(value) || 0
          : parseFloat(newItems[index].hours) || 0;
      const minutes =
        field === "minutes"
          ? parseFloat(value) || 0
          : parseFloat(newItems[index].minutes) || 0;
      const rate =
        field === "rate"
          ? parseFloat(value) || 0
          : parseFloat(newItems[index].rate) || 0;
      const totalHours = hours + minutes / 60;
      newItems[index].total = totalHours * rate;
    }

    onChange(newItems);
  };

  const removeItem = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Line Items</h3>
        <Button
          type="button"
          onClick={addItem}
          variant="outline"
          size="sm"
          className="text-green-600 border-green-600 hover:bg-green-50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <p className="text-gray-500">
            No line items yet. Click "Add Item" to start.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3"
            >
              <div className="flex gap-3 items-start">
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-500 mb-1 block">
                    Description
                  </label>
                  <Input
                    value={item.description}
                    onChange={(e) =>
                      updateItem(index, "description", e.target.value)
                    }
                    placeholder="Service description"
                    className="bg-white"
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => removeItem(index)}
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:bg-red-50 mt-5"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">
                    Hours
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={item.hours}
                    onChange={(e) => updateItem(index, "hours", e.target.value)}
                    placeholder="0"
                    className="bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">
                    Minutes
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={item.minutes}
                    onChange={(e) =>
                      updateItem(index, "minutes", e.target.value)
                    }
                    placeholder="0"
                    className="bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">
                    Rate/Hr ($)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.rate}
                    onChange={(e) => updateItem(index, "rate", e.target.value)}
                    placeholder="0.00"
                    className="bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">
                    Total ($)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.total}
                    onChange={(e) => updateItem(index, "total", e.target.value)}
                    placeholder="0.00"
                    className="bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block flex items-center gap-1">
                    <Link className="w-3 h-3" /> Link Label
                  </label>
                  <Input
                    value={item.link_label}
                    onChange={(e) =>
                      updateItem(index, "link_label", e.target.value)
                    }
                    placeholder="e.g., Clockify Link"
                    className="bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">
                    Link URL
                  </label>
                  <Input
                    value={item.link}
                    onChange={(e) => updateItem(index, "link", e.target.value)}
                    placeholder="https://..."
                    className="bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Note (optional)
                </label>
                <Input
                  value={item.note || ""}
                  onChange={(e) => updateItem(index, "note", e.target.value)}
                  placeholder="Additional note for this item..."
                  className="bg-white"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
