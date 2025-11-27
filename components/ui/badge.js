import React from "react";

const cx = (...classes) => classes.filter(Boolean).join(" ");

export const Badge = ({ className = "", children, ...props }) => (
  <span
    className={cx(
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-700",
      className
    )}
    {...props}
  >
    {children}
  </span>
);

export default Badge;
