"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminLoginSchema = exports.createIntakeSchema = exports.createFulfillmentSchema = exports.calculateCommissionSchema = exports.verifyPaymentSchema = exports.createPaymentOrderSchema = exports.updateBookingSchema = exports.createBookingSchema = exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                res.status(400).json({
                    status: "fail",
                    error: "Validation error",
                    details: error.errors.map((err) => ({
                        field: err.path.slice(1).join("."),
                        message: err.message,
                    })),
                });
                return;
            }
            next(error);
        }
    };
};
exports.validate = validate;
// Booking Request Validation
exports.createBookingSchema = zod_1.z.object({
    body: zod_1.z.object({
        customerName: zod_1.z.string().min(2, "Name must be at least 2 characters"),
        email: zod_1.z.string().email("Invalid email format"),
        phone: zod_1.z.string().min(5, "Phone number must be at least 5 digits"),
        country: zod_1.z.string().min(2, "Country must be at least 2 characters"),
        packageType: zod_1.z.enum(["market-express", "premium-event"], {
            errorMap: () => ({ message: "packageType must be 'market-express' or 'premium-event'" }),
        }),
        bookingDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
        bookingTime: zod_1.z.string().min(1, "Preferred booking time slot is required"),
        notes: zod_1.z.string().optional(),
    }),
});
exports.updateBookingSchema = zod_1.z.object({
    body: zod_1.z.object({
        paymentStatus: zod_1.z.enum(["PENDING", "SUCCESS", "FAILED"]).optional(),
        bookingStatus: zod_1.z.enum([
            "PENDING",
            "CONFIRMED",
            "STYLIST_ASSIGNED",
            "SESSION_SCHEDULED",
            "COMPLETED",
            "CANCELLED",
        ]).optional(),
        assignedTo: zod_1.z.string().optional(),
        meetingLink: zod_1.z.string().url("Invalid meeting URL format").optional().or(zod_1.z.literal("")),
        notes: zod_1.z.string().optional(),
    }),
});
// Payments API Validation
exports.createPaymentOrderSchema = zod_1.z.object({
    body: zod_1.z.object({
        bookingId: zod_1.z.string().min(1, "Booking ID is required"),
    }),
});
exports.verifyPaymentSchema = zod_1.z.object({
    body: zod_1.z.object({
        orderId: zod_1.z.string().min(1, "Order ID is required"),
        shouldSucceed: zod_1.z.boolean().optional(),
    }),
});
// Commission API Validation
exports.calculateCommissionSchema = zod_1.z.object({
    body: zod_1.z.object({
        basketValue: zod_1.z.number().positive("Basket value must be positive"),
    }),
});
// Fulfillment API Validation
exports.createFulfillmentSchema = zod_1.z.object({
    body: zod_1.z.object({
        bookingId: zod_1.z.string().min(1, "Booking ID is required"),
        basketValue: zod_1.z.number().positive("Basket value must be positive"),
        shippingCost: zod_1.z.number().nonnegative("Shipping cost must be non-negative"),
        trackingNumber: zod_1.z.string().optional(),
        courierName: zod_1.z.string().optional(),
    }),
});
// Client Intake Validation
exports.createIntakeSchema = zod_1.z.object({
    body: zod_1.z.object({
        fullName: zod_1.z.string().min(2, "Full name is required"),
        country: zod_1.z.string().min(2, "Country is required"),
        city: zod_1.z.string().min(2, "City is required"),
        timezone: zod_1.z.string().min(2, "Timezone is required"),
        whatsapp: zod_1.z.string().min(5, "WhatsApp is required"),
        language: zod_1.z.string().min(2, "Language is required"),
        categories: zod_1.z.array(zod_1.z.string()).min(1, "Select at least one category"),
        bespokeRequest: zod_1.z.string().optional(),
        gender: zod_1.z.string().optional(),
        internationalSize: zod_1.z.string().optional(),
        measurements: zod_1.z.object({
            bust: zod_1.z.string().optional(),
            waist: zod_1.z.string().optional(),
            shoulders: zod_1.z.string().optional(),
            height: zod_1.z.string().optional(),
        }).optional(),
        colorPalette: zod_1.z.string().optional(),
        designStyle: zod_1.z.string().optional(),
        inspirationUrl: zod_1.z.string().url("Invalid inspiration URL").optional().or(zod_1.z.literal("")),
        deliveryDate: zod_1.z.string().optional(),
        budget: zod_1.z.string().min(1, "Budget tier is required"),
        shippingNotes: zod_1.z.string().optional(),
        digitalSignature: zod_1.z.string().min(2, "Digital signature is required"),
    }),
});
// Admin Authentication Validation
exports.adminLoginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email format"),
        password: zod_1.z.string().min(5, "Password must be at least 5 characters"),
    }),
});
