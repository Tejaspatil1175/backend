import crypto from "crypto";

export const generateUniqueId = () => {
  return crypto.randomBytes(16).toString("hex");
};

export const formatCurrency = (amount, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};

export const calculatePercentage = (amount, total) => {
  return total === 0 ? 0 : ((amount / total) * 100).toFixed(2);
};

export const getCurrentTimestamp = () => {
  return new Date().toISOString();
};
