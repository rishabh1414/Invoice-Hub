import React from "react";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto p-4 md:p-8">{children}</main>
    </div>
  );
}
