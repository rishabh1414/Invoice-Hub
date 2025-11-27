import React, { forwardRef } from "react";

const cx = (...classes) => classes.filter(Boolean).join(" ");

export const Input = forwardRef(({ className = "", ...props }, ref) => (
  <input
    ref={ref}
    className={cx(
      "flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",
      className
    )}
    {...props}
  />
));

Input.displayName = "Input";

export default Input;
