import React, { forwardRef } from "react";

const cx = (...classes) => classes.filter(Boolean).join(" ");

const variants = {
  default: "bg-gray-900 text-white hover:bg-gray-800",
  outline:
    "border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:bg-gray-50",
  ghost: "text-gray-700 hover:bg-gray-100",
  link: "text-green-600 hover:underline p-0 h-auto",
};

const sizes = {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3",
  icon: "h-9 w-9 p-0",
};

export const Button = forwardRef(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cx(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant] || variants.default,
        sizes[size] || sizes.default,
        className
      )}
      {...props}
    />
  )
);

Button.displayName = "Button";

export default Button;
