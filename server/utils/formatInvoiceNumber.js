function formatInvoiceNumber(nextNumber) {
  return `RC-IN-${String(nextNumber).padStart(4, "0")}`;
}

module.exports = { formatInvoiceNumber };
