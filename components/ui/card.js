import React from "react";

const cx = (...classes) => classes.filter(Boolean).join(" ");

export const Card = React.forwardRef(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={cx(
      "rounded-xl border border-gray-200 bg-white shadow-sm",
      className
    )}
    {...props}
  />
));

Card.displayName = "Card";

export const CardHeader = ({ className = "", ...props }) => (
  <div className={cx("p-4", className)} {...props} />
);

export const CardTitle = ({ className = "", ...props }) => (
  <h3 className={cx("text-lg font-semibold leading-none", className)} {...props} />
);

export const CardContent = ({ className = "", ...props }) => (
  <div className={cx("p-4 pt-0", className)} {...props} />
);

export default Card;
