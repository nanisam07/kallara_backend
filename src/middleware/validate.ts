import { Request, Response, NextFunction } from "express";
import { z, AnyZodObject, ZodError } from "zod";

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
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

// Booking Request Validation
export const createBookingSchema = z.object({
  body: z.object({
    customerName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    phone: z.string().min(5, "Phone number must be at least 5 digits"),
    country: z.string().min(2, "Country must be at least 2 characters"),
    packageType: z.enum(["market-express", "premium-event"], {
      errorMap: () => ({ message: "packageType must be 'market-express' or 'premium-event'" }),
    }),
    bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    bookingTime: z.string().min(1, "Preferred booking time slot is required"),
    notes: z.string().optional(),
  }),
});

export const updateBookingSchema = z.object({
  body: z.object({
    paymentStatus: z.enum(["PENDING", "SUCCESS", "FAILED"]).optional(),
    bookingStatus: z.enum([
      "PENDING",
      "CONFIRMED",
      "STYLIST_ASSIGNED",
      "SESSION_SCHEDULED",
      "COMPLETED",
      "CANCELLED",
    ]).optional(),
    assignedTo: z.string().optional(),
    meetingLink: z.string().url("Invalid meeting URL format").optional().or(z.literal("")),
    notes: z.string().optional(),
  }),
});

// Payments API Validation
export const createPaymentOrderSchema = z.object({
  body: z.object({
    bookingId: z.string().min(1, "Booking ID is required"),
  }),
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    orderId: z.string().min(1, "Order ID is required"),
    shouldSucceed: z.boolean().optional(),
  }),
});

// Commission API Validation
export const calculateCommissionSchema = z.object({
  body: z.object({
    basketValue: z.number().positive("Basket value must be positive"),
  }),
});

// Fulfillment API Validation
export const createFulfillmentSchema = z.object({
  body: z.object({
    bookingId: z.string().min(1, "Booking ID is required"),
    basketValue: z.number().positive("Basket value must be positive"),
    shippingCost: z.number().nonnegative("Shipping cost must be non-negative"),
    trackingNumber: z.string().optional(),
    courierName: z.string().optional(),
  }),
});

// Client Intake Validation
export const createIntakeSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, "Full name is required"),
    country: z.string().min(2, "Country is required"),
    city: z.string().min(2, "City is required"),
    timezone: z.string().min(2, "Timezone is required"),
    whatsapp: z.string().min(5, "WhatsApp is required"),
    language: z.string().min(2, "Language is required"),
    categories: z.array(z.string()).min(1, "Select at least one category"),
    bespokeRequest: z.string().optional(),
    gender: z.string().optional(),
    internationalSize: z.string().optional(),
    measurements: z.object({
      bust: z.string().optional(),
      waist: z.string().optional(),
      shoulders: z.string().optional(),
      height: z.string().optional(),
    }).optional(),
    colorPalette: z.string().optional(),
    designStyle: z.string().optional(),
    inspirationUrl: z.string().url("Invalid inspiration URL").optional().or(z.literal("")),
    deliveryDate: z.string().optional(),
    budget: z.string().min(1, "Budget tier is required"),
    shippingNotes: z.string().optional(),
    digitalSignature: z.string().min(2, "Digital signature is required"),
  }),
});

// Admin Authentication Validation
export const adminLoginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(5, "Password must be at least 5 characters"),
  }),
});
