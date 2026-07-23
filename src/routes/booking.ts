import { Router, Response } from "express";
import { query } from "../db/db";
import { validate, createBookingSchema, updateBookingSchema } from "../middleware/validate";
import { authenticateAdmin, AuthenticatedRequest } from "../middleware/auth";
import { NotificationService } from "../services/NotificationService";

const router = Router();

// Create Booking (Public)
router.post("/", validate(createBookingSchema), async (req, res): Promise<void> => {
  const { customerName, email, phone, country, packageType, bookingDate, bookingTime, notes } = req.body;

  // Determine price based on package type
  const packagePrice = packageType === "market-express" ? 45.00 : 150.00;
  
  // Generate unique bookingId: KL-YYYYMMDD-RAND
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  const bookingId = `KL-${dateStr}-${randStr}`;

  try {
    const result = await query(
      `INSERT INTO bookings (
        booking_id, customer_name, email, phone, country, package_type, 
        package_price, booking_date, booking_time, payment_status, booking_status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;`,
      [
        bookingId,
        customerName,
        email,
        phone,
        country,
        packageType,
        packagePrice,
        bookingDate,
        bookingTime,
        "PENDING",
        "PENDING",
        notes || "",
      ]
    );

    const booking = result.rows[0];

    // Trigger placeholder booking confirmation email asynchronously
    NotificationService.sendBookingConfirmation(email, {
      bookingId: booking.booking_id,
      customerName: booking.customer_name,
      packageType: booking.package_type,
      packagePrice: parseFloat(booking.package_price),
      date: booking.booking_date.toISOString().slice(0, 10),
      time: booking.booking_time,
    }).catch(console.error);

    res.status(201).json({
      status: "success",
      booking,
    });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

// Get Booking (Public - by UUID or public Booking ID)
router.get("/:id", async (req, res): Promise<void> => {
  const idOrBookingId = req.params.id;

  try {
    let result;
    // Check if the id param is a UUID format or bookingId format
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idOrBookingId);
    
    if (isUuid) {
      result = await query("SELECT * FROM bookings WHERE id = $1 LIMIT 1;", [idOrBookingId]);
    } else {
      result = await query("SELECT * FROM bookings WHERE booking_id = $1 LIMIT 1;", [idOrBookingId]);
    }

    if (result.rows.length === 0) {
      res.status(404).json({ status: "fail", message: "Booking not found" });
      return;
    }

    res.json({
      status: "success",
      booking: result.rows[0],
    });
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

// List Bookings (Admin Only)
router.get("/", authenticateAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await query("SELECT * FROM bookings ORDER BY created_at DESC;");
    res.json({
      status: "success",
      results: result.rows.length,
      bookings: result.rows,
    });
  } catch (error) {
    console.error("List bookings error:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

// Update Booking Status (Admin Only)
router.patch("/:id", authenticateAdmin, validate(updateBookingSchema), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const updates = req.body;

  try {
    // Check if booking exists
    const checkResult = await query("SELECT * FROM bookings WHERE id = $1 LIMIT 1;", [id]);
    if (checkResult.rows.length === 0) {
      res.status(404).json({ status: "fail", message: "Booking not found" });
      return;
    }

    const currentBooking = checkResult.rows[0];

    // Build dynamic UPDATE query
    const fields: string[] = [];
    const values: any[] = [];
    let queryIndex = 1;

    Object.keys(updates).forEach((key) => {
      // Map camelCase body to snake_case DB columns if necessary
      const dbKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      fields.push(`${dbKey} = $${queryIndex}`);
      values.push(updates[key]);
      queryIndex++;
    });

    if (fields.length === 0) {
      res.status(400).json({ status: "fail", message: "No update fields provided" });
      return;
    }

    values.push(id);
    const updateQuery = `
      UPDATE bookings 
      SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${queryIndex} 
      RETURNING *;
    `;

    const result = await query(updateQuery, values);
    const updatedBooking = result.rows[0];

    // If meetingLink and assignedTo are updated, trigger meeting notification email
    const becameScheduled = 
      (updates.bookingStatus === "SESSION_SCHEDULED" || updates.bookingStatus === "STYLIST_ASSIGNED") &&
      updatedBooking.meeting_link && 
      updatedBooking.assigned_to;

    if (becameScheduled) {
      NotificationService.sendSessionMeetingLink(updatedBooking.email, {
        bookingId: updatedBooking.booking_id,
        customerName: updatedBooking.customer_name,
        meetingLink: updatedBooking.meeting_link,
        date: updatedBooking.booking_date.toISOString().slice(0, 10),
        time: updatedBooking.booking_time,
        stylistName: updatedBooking.assigned_to,
      }).catch(console.error);
    }

    res.json({
      status: "success",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Update booking error:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

export default router;
