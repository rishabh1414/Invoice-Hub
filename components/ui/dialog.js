import React from "react";

const cx = (...classes) => classes.filter(Boolean).join(" ");

export const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={() => onOpenChange?.(false)}
    >
      <div
        className="absolute inset-0 bg-black/30"
        aria-hidden="true"
      />
      <div
        className="relative z-10 w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export const DialogContent = ({ className = "", ...props }) => (
  <div
    className={cx(
      "rounded-lg bg-white shadow-xl border border-gray-200 p-6",
      className
    )}
    {...props}
  />
);

export const DialogHeader = ({ className = "", ...props }) => (
  <div className={cx("mb-4", className)} {...props} />
);

export const DialogTitle = ({ className = "", ...props }) => (
  <h3 className={cx("text-lg font-semibold", className)} {...props} />
);

export const DialogDescription = ({ className = "", ...props }) => (
  <p className={cx("text-sm text-gray-600", className)} {...props} />
);

export default Dialog;
