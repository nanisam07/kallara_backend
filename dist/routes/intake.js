"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db/db");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
// Create Intake Profile (Public)
router.post("/", (0, validate_1.validate)(validate_1.createIntakeSchema), async (req, res) => {
    const { fullName, country, city, timezone, whatsapp, language, categories, bespokeRequest, gender, internationalSize, measurements, colorPalette, designStyle, inspirationUrl, deliveryDate, budget, shippingNotes, digitalSignature, } = req.body;
    try {
        const result = await (0, db_1.query)(`INSERT INTO intake_profiles (
        full_name, country, city, timezone, whatsapp, language, categories,
        bespoke_request, gender, international_size, measurements, color_palette,
        design_style, inspiration_url, delivery_date, budget, shipping_notes, digital_signature
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *;`, [
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
        ]);
        res.status(201).json({
            status: "success",
            intake: result.rows[0],
        });
    }
    catch (error) {
        console.error("Create intake profile error:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});
exports.default = router;
