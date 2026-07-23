"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db/db");
const validate_1 = require("../middleware/validate");
const PaymentService_1 = require("../services/PaymentService");
const router = (0, express_1.Router)();
// Create Payment Order (Public)
router.post("/create-order", (0, validate_1.validate)(validate_1.createPaymentOrderSchema), async (req, res) => {
    const { bookingId } = req.body;
    try {
        // 1. Fetch booking to get the price
        const bookingResult = await (0, db_1.query)("SELECT booking_id, package_price FROM bookings WHERE booking_id = $1 OR id::text = $1 LIMIT 1;", [bookingId]);
        if (bookingResult.rows.length === 0) {
            res.status(404).json({ status: "fail", message: "Booking not found" });
            return;
        }
        const booking = bookingResult.rows[0];
        const amount = parseFloat(booking.package_price);
        const resolvedBookingId = booking.booking_id;
        // 2. Call Payment Service to create order
        const order = await PaymentService_1.paymentService.createOrder(amount, "USD", resolvedBookingId);
        // 3. Save pending transaction in database
        await (0, db_1.query)(`INSERT INTO payments (booking_id, transaction_id, gateway, amount, currency, status) 
       VALUES ($1, $2, $3, $4, $5, $6);`, [resolvedBookingId, order.orderId, "MOCK", amount, "USD", "PENDING"]);
        res.json({
            status: "success",
            order,
        });
    }
    catch (error) {
        console.error("Create payment order error:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});
// Verify Payment (Public)
router.post("/verify", (0, validate_1.validate)(validate_1.verifyPaymentSchema), async (req, res) => {
    const { orderId, shouldSucceed } = req.body;
    try {
        // 1. Check if the payment record exists
        const paymentResult = await (0, db_1.query)("SELECT * FROM payments WHERE transaction_id = $1 LIMIT 1;", [orderId]);
        if (paymentResult.rows.length === 0) {
            res.status(404).json({ status: "fail", message: "Payment order not found" });
            return;
        }
        const payment = paymentResult.rows[0];
        // 2. Call Payment Service to verify
        const verification = await PaymentService_1.paymentService.verifyPayment(orderId, {
            shouldSucceed: shouldSucceed !== false
        });
        const newStatus = verification.success ? "SUCCESS" : "FAILED";
        const newBookingStatus = verification.success ? "CONFIRMED" : "PENDING";
        // 3. Update payment status in DB
        await (0, db_1.query)("UPDATE payments SET status = $1 WHERE transaction_id = $2;", [newStatus, orderId]);
        // 4. Update booking payment_status & booking_status in DB
        await (0, db_1.query)(`UPDATE bookings 
       SET payment_status = $1, booking_status = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE booking_id = $3;`, [newStatus, newBookingStatus, payment.booking_id]);
        res.json({
            status: "success",
            paymentStatus: newStatus,
            bookingStatus: newBookingStatus,
            transactionId: verification.transactionId,
        });
    }
    catch (error) {
        console.error("Verify payment error:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});
exports.default = router;
