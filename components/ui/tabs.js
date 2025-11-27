import React, { createContext, useContext } from "react";

const TabsContext = createContext(null);

export const Tabs = ({ value, onValueChange, children, className = "" }) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ className = "", ...props }) => (
  <div className={`inline-flex rounded-md bg-gray-100 p-1 ${className}`} {...props} />
);

export const TabsTrigger = ({ value, children, className = "" }) => {
  const ctx = useContext(TabsContext);
  const isActive = ctx?.value === value;
  return (
    <button
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        isActive
          ? "bg-white text-green-700 shadow-sm"
          : "text-gray-600 hover:text-gray-800"
      } ${className}`}
      onClick={() => ctx?.onValueChange?.(value)}
      type="button"
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, children }) => {
  const ctx = useContext(TabsContext);
  if (ctx?.value !== value) return null;
  return <div className="mt-4">{children}</div>;
};

export default Tabs;
