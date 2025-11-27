import React, { forwardRef } from "react";

const cx = (...classes) => classes.filter(Boolean).join(" ");

export const Textarea = forwardRef(({ className = "", ...props }, ref) => (
  <textarea
    ref={ref}
    className={cx(
      "flex w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",
      className
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";

export default Textarea;
