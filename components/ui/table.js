import React from "react";

const cx = (...classes) => classes.filter(Boolean).join(" ");

export const Table = ({ className = "", ...props }) => (
  <table
    className={cx("w-full border-collapse text-sm text-gray-800", className)}
    {...props}
  />
);

export const TableHeader = ({ className = "", ...props }) => (
  <thead className={className} {...props} />
);

export const TableBody = ({ className = "", ...props }) => (
  <tbody className={className} {...props} />
);

export const TableRow = ({ className = "", ...props }) => (
  <tr className={cx("border-b border-gray-200", className)} {...props} />
);

export const TableHead = ({ className = "", ...props }) => (
  <th
    className={cx(
      "text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3",
      className
    )}
    {...props}
  />
);

export const TableCell = ({ className = "", ...props }) => (
  <td className={cx("px-4 py-3 align-top", className)} {...props} />
);

export default Table;
