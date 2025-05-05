/**
 * Represents a payment confirmation.
 */
export interface PaymentConfirmation {
  /**
   * The amount of the payment.
   */
  amount: number;
  /**
   * The currency of the payment.
   */
  currency: string;
  /**
   * A transaction ID or reference for the payment.
   */
  transactionId: string;
}

/**
 * Asynchronously processes a payment (Simulated).
 * In a real app, this would call the backend, which then calls the payment gateway.
 *
 * @param amount The amount to pay.
 * @returns A promise that resolves to a PaymentConfirmation object.
 * @throws {Error} If the payment amount is invalid.
 */
export async function processPayment(amount: number): Promise<PaymentConfirmation> {
  console.log(`Simulating processing payment for amount: ${amount}`);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 750));

  if (amount <= 0) {
     console.error("Payment failed: Amount must be positive.");
     throw new Error("Payment amount must be positive.");
  }

  // Simulate success
  const confirmation: PaymentConfirmation = {
    amount: amount,
    currency: 'USD', // Assuming USD for now
    transactionId: `SIM_PAY_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
  };
  console.log("Simulated payment successful:", confirmation);
  return confirmation;
}
