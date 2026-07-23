export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
}

export interface IPaymentGateway {
  createOrder(amount: number, currency: string, bookingId: string): Promise<PaymentOrder>;
  verifyPayment(orderId: string, verificationData: any): Promise<{ success: boolean; transactionId: string }>;
}

export class MockPaymentGateway implements IPaymentGateway {
  public async createOrder(amount: number, currency: string, bookingId: string): Promise<PaymentOrder> {
    // Generate a unique mock order ID (resembles Razorpay order format)
    const orderId = `order_mock_${Math.random().toString(36).substring(2, 15)}`;
    return {
      orderId,
      amount,
      currency,
      status: "PENDING",
    };
  }

  public async verifyPayment(orderId: string, verificationData: { shouldSucceed: boolean }): Promise<{ success: boolean; transactionId: string }> {
    // Determine payment outcome based on what was passed (or default to true)
    const success = verificationData.shouldSucceed !== false;
    const transactionId = `txn_mock_${Math.random().toString(36).substring(2, 15)}`;
    
    return {
      success,
      transactionId,
    };
  }
}

// In the future, a RazorpayGateway can be added like this:
/*
export class RazorpayGateway implements IPaymentGateway {
  ...
}
*/

export class PaymentService {
  private gateway: IPaymentGateway;

  constructor(gateway: IPaymentGateway = new MockPaymentGateway()) {
    this.gateway = gateway;
  }

  public async createOrder(amount: number, currency: string, bookingId: string): Promise<PaymentOrder> {
    return this.gateway.createOrder(amount, currency, bookingId);
  }

  public async verifyPayment(orderId: string, verificationData: any): Promise<{ success: boolean; transactionId: string }> {
    return this.gateway.verifyPayment(orderId, verificationData);
  }
}

export const paymentService = new PaymentService();
export default paymentService;
