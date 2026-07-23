"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = exports.PaymentService = exports.MockPaymentGateway = void 0;
class MockPaymentGateway {
    async createOrder(amount, currency, bookingId) {
        // Generate a unique mock order ID (resembles Razorpay order format)
        const orderId = `order_mock_${Math.random().toString(36).substring(2, 15)}`;
        return {
            orderId,
            amount,
            currency,
            status: "PENDING",
        };
    }
    async verifyPayment(orderId, verificationData) {
        // Determine payment outcome based on what was passed (or default to true)
        const success = verificationData.shouldSucceed !== false;
        const transactionId = `txn_mock_${Math.random().toString(36).substring(2, 15)}`;
        return {
            success,
            transactionId,
        };
    }
}
exports.MockPaymentGateway = MockPaymentGateway;
// In the future, a RazorpayGateway can be added like this:
/*
export class RazorpayGateway implements IPaymentGateway {
  ...
}
*/
class PaymentService {
    gateway;
    constructor(gateway = new MockPaymentGateway()) {
        this.gateway = gateway;
    }
    async createOrder(amount, currency, bookingId) {
        return this.gateway.createOrder(amount, currency, bookingId);
    }
    async verifyPayment(orderId, verificationData) {
        return this.gateway.verifyPayment(orderId, verificationData);
    }
}
exports.PaymentService = PaymentService;
exports.paymentService = new PaymentService();
exports.default = exports.paymentService;
