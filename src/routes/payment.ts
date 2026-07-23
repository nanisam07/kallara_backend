import { Router } from "express";
import { query } from "../db/db";
import { validate, createPaymentOrderSchema, verifyPaymentSchema } from "../middleware/validate";
import { paymentService } from "../services/PaymentService";

const router = Router();

// Create Payment Order (Public)
router.post("/create-order", validate(createPaymentOrderSchema), async (req, res): Promise<void> => {
  const { bookingId } = req.body;

  try {
    // 1. Fetch booking to get the price
    const bookingResult = await query(
      "SELECT booking_id, package_price FROM bookings WHERE booking_id = $1 OR id::text = $1 LIMIT 1;",
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      res.status(404).json({ status: "fail", message: "Booking not found" });
      return;
    }

    const booking = bookingResult.rows[0];
    const amount = parseFloat(booking.package_price);
    const resolvedBookingId = booking.booking_id;

    // 2. Call Payment Service to create order
    const order = await paymentService.createOrder(amount, "USD", resolvedBookingId);

    // 3. Save pending transaction in database
    await query(
      `INSERT INTO payments (booking_id, transaction_id, gateway, amount, currency, status) 
       VALUES ($1, $2, $3, $4, $5, $6);`,
      [resolvedBookingId, order.orderId, "MOCK", amount, "USD", "PENDING"]
    );

    res.json({
      status: "success",
      order,
    });
  } catch (error) {
    console.error("Create payment order error:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

// Verify Payment (Public)
router.post("/verify", validate(verifyPaymentSchema), async (req, res): Promise<void> => {
  const { orderId, shouldSucceed } = req.body;

  try {
    // 1. Check if the payment record exists
    const paymentResult = await query(
      "SELECT * FROM payments WHERE transaction_id = $1 LIMIT 1;",
      [orderId]
    );

    if (paymentResult.rows.length === 0) {
      res.status(404).json({ status: "fail", message: "Payment order not found" });
      return;
    }

    const payment = paymentResult.rows[0];

    // 2. Call Payment Service to verify
    const verification = await paymentService.verifyPayment(orderId, { 
      shouldSucceed: shouldSucceed !== false 
    });

    const newStatus = verification.success ? "SUCCESS" : "FAILED";
    const newBookingStatus = verification.success ? "CONFIRMED" : "PENDING";

    // 3. Update payment status in DB
    await query(
      "UPDATE payments SET status = $1 WHERE transaction_id = $2;",
      [newStatus, orderId]
    );

    // 4. Update booking payment_status & booking_status in DB
    await query(
      `UPDATE bookings 
       SET payment_status = $1, booking_status = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE booking_id = $3;`,
      [newStatus, newBookingStatus, payment.booking_id]
    );

    res.json({
      status: "success",
      paymentStatus: newStatus,
      bookingStatus: newBookingStatus,
      transactionId: verification.transactionId,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

export default router;
