import { Router } from "express";
import { query } from "../db/db";
import { validate, calculateCommissionSchema } from "../middleware/validate";
import { CommissionService } from "../services/CommissionService";

const router = Router();

// Calculate Commission (Public)
router.post("/calculate", validate(calculateCommissionSchema), async (req, res): Promise<void> => {
  const { basketValue } = req.body;

  try {
    const result = CommissionService.calculate(basketValue);
    res.json({
      status: "success",
      data: result,
    });
  } catch (error) {
    console.error("Calculate commission error:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

export default router;
