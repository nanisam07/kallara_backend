import { Router } from "express";
import { query } from "../db/db";
import { validate, createIntakeSchema } from "../middleware/validate";

const router = Router();

// Create Intake Profile (Public)
router.post("/", validate(createIntakeSchema), async (req, res): Promise<void> => {
  const {
    fullName,
    country,
    city,
    timezone,
    whatsapp,
    language,
    categories,
    bespokeRequest,
    gender,
    internationalSize,
    measurements,
    colorPalette,
    designStyle,
    inspirationUrl,
    deliveryDate,
    budget,
    shippingNotes,
    digitalSignature,
  } = req.body;

  try {
    const result = await query(
      `INSERT INTO intake_profiles (
        full_name, country, city, timezone, whatsapp, language, categories,
        bespoke_request, gender, international_size, measurements, color_palette,
        design_style, inspiration_url, delivery_date, budget, shipping_notes, digital_signature
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *;`,
      [
        fullName,
        country,
        city,
        timezone,
        whatsapp,
        language,
        categories,
        bespokeRequest || null,
        gender || null,
        internationalSize || null,
        measurements ? JSON.stringify(measurements) : null,
        colorPalette || null,
        designStyle || null,
        inspirationUrl || null,
        deliveryDate ? new Date(deliveryDate) : null,
        budget,
        shippingNotes || null,
        digitalSignature,
      ]
    );

    res.status(201).json({
      status: "success",
      intake: result.rows[0],
    });
  } catch (error) {
    console.error("Create intake profile error:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

export default router;
