"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validate_1 = require("../middleware/validate");
const CommissionService_1 = require("../services/CommissionService");
const router = (0, express_1.Router)();
// Calculate Commission (Public)
router.post("/calculate", (0, validate_1.validate)(validate_1.calculateCommissionSchema), async (req, res) => {
    const { basketValue } = req.body;
    try {
        const result = CommissionService_1.CommissionService.calculate(basketValue);
        res.json({
            status: "success",
            data: result,
        });
    }
    catch (error) {
        console.error("Calculate commission error:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});
exports.default = router;
