import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const cx = (...classes) => classes.filter(Boolean).join(" ");

const SelectContext = createContext(null);

export const Select = ({ value, onValueChange, children, className = "" }) => {
  const [items, setItems] = useState([]);

  const registerItem = (item) => {
    setItems((prev) => {
      if (prev.find((p) => p.value === item.value)) return prev;
      return [...prev, item];
    });
  };

  const ctx = useMemo(
    () => ({ value, onValueChange, items, registerItem }),
    [value, onValueChange, items]
  );

  return (
    <SelectContext.Provider value={ctx}>
      <div className={cx("relative inline-block", className)}>{children}</div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger = ({ className = "" }) => {
  const ctx = useContext(SelectContext);
  if (!ctx) return null;
  return (
    <select
      className={cx(
        "h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500",
        className
      )}
      value={ctx.value}
      onChange={(e) => ctx.onValueChange?.(e.target.value)}
    >
      {ctx.items.map((item) => (
        <option key={item.value} value={item.value}>
          {item.children || item.value}
        </option>
      ))}
    </select>
  );
};

export const SelectContent = ({ children }) => {
  return <>{children}</>;
};

export const SelectItem = ({ value, children }) => {
  const ctx = useContext(SelectContext);
  useEffect(() => {
    ctx?.registerItem({ value, children });
  }, [ctx, value, children]);
  return null;
};

export const SelectValue = () => null;

export default Select;
