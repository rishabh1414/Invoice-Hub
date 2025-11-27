import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";

export default function AdjustmentsEditor({ adjustments, onChange }) {
  const addAdjustment = () => {
    onChange([...adjustments, { description: "", amount: 0 }]);
  };

  const updateAdjustment = (index, field, value) => {
    const newAdjustments = [...adjustments];
    newAdjustments[index] = { ...newAdjustments[index], [field]: value };
    onChange(newAdjustments);
  };

  const removeAdjustment = (index) => {
    onChange(adjustments.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Adjustments</h3>
        <Button
          type="button"
          onClick={addAdjustment}
          variant="outline"
          size="sm"
          className="text-purple-600 border-purple-600 hover:bg-purple-50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Adjustment
        </Button>
      </div>

      {adjustments.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No adjustments</p>
      ) : (
        <div className="space-y-2">
          {adjustments.map((adj, index) => (
            <div key={index} className="flex gap-3 items-center">
              <Input
                value={adj.description}
                onChange={(e) =>
                  updateAdjustment(index, "description", e.target.value)
                }
                placeholder="Adjustment description"
                className="flex-1"
              />
              <Input
                type="number"
                step="0.01"
                value={adj.amount}
                onChange={(e) =>
                  updateAdjustment(
                    index,
                    "amount",
                    parseFloat(e.target.value) || 0
                  )
                }
                placeholder="0.00"
                className="w-32"
              />
              <Button
                type="button"
                onClick={() => removeAdjustment(index)}
                variant="ghost"
                size="icon"
                className="text-red-500 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
