"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db/db");
const validate_1 = require("../middleware/validate");
const auth_1 = require("../middleware/auth");
const CommissionService_1 = require("../services/CommissionService");
const NotificationService_1 = require("../services/NotificationService");
const router = (0, express_1.Router)();
// Create Fulfillment Order (Admin Only)
router.post("/", auth_1.authenticateAdmin, (0, validate_1.validate)(validate_1.createFulfillmentSchema), async (req, res) => {
    const { bookingId, basketValue, shippingCost, trackingNumber, courierName } = req.body;
    try {
        // 1. Check if booking exists
        const bookingResult = await (0, db_1.query)("SELECT booking_id, customer_name, email FROM bookings WHERE booking_id = $1 LIMIT 1;", [bookingId]);
        if (bookingResult.rows.length === 0) {
            res.status(404).json({ status: "fail", message: "Booking not found" });
            return;
        }
        const booking = bookingResult.rows[0];
        // 2. Automatically calculate commission percentage & amount
        const commission = CommissionService_1.CommissionService.calculate(basketValue);
        // 3. Create fulfillment record
        const result = await (0, db_1.query)(`INSERT INTO fulfillment_orders (
        booking_id, basket_value, commission_percentage, commission_amount, shipping_cost, tracking_number, courier_name
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;`, [
            booking.booking_id,
            basketValue,
            commission.commissionPercentage,
            commission.commissionAmount,
            shippingCost,
            trackingNumber || null,
            courierName || null,
        ]);
        // 4. Update booking lifecycle status to COMPLETED
        await (0, db_1.query)("UPDATE bookings SET booking_status = 'COMPLETED', updated_at = CURRENT_TIMESTAMP WHERE booking_id = $1;", [booking.booking_id]);
        // 5. Trigger mock shipment dispatch email alert if tracking details are supplied
        if (trackingNumber && courierName) {
            NotificationService_1.NotificationService.sendShipmentTracking(booking.email, {
                bookingId: booking.booking_id,
                customerName: booking.customer_name,
                courierName,
                trackingNumber,
            }).catch(console.error);
        }
        res.status(201).json({
            status: "success",
            fulfillment: result.rows[0],
        });
    }
    catch (error) {
        console.error("Create fulfillment error:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});
// Get Fulfillment Details (Admin Only)
router.get("/:bookingId", auth_1.authenticateAdmin, async (req, res) => {
    const { bookingId } = req.params;
    try {
        const result = await (0, db_1.query)("SELECT * FROM fulfillment_orders WHERE booking_id = $1 LIMIT 1;", [bookingId]);
        if (result.rows.length === 0) {
            res.status(404).json({ status: "fail", message: "Fulfillment details not found for this booking" });
            return;
        }
        res.json({
            status: "success",
            fulfillment: result.rows[0],
        });
    }
    catch (error) {
        console.error("Get fulfillment error:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});
exports.default = router;
