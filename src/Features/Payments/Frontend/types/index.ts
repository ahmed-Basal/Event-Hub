export interface CheckoutSessionResult {
  orderId: string;
  sessionId: string;
  checkoutUrl: string;
  isSandbox: boolean;
}
