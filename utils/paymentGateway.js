export const processPayment = async (amount, paymentMethod) => {
  try {
    // Simulate a payment processing
    const transactionId = `txn_${Date.now()}`;
    const status = "success"; // Simulate a successful payment

    return {
      transactionId,
      status,
    };
  } catch (error) {
    throw new Error("Payment processing failed");
  }
}; 