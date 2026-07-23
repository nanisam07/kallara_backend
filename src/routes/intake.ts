import { Router } from "express";
import { validate, createIntakeSchema } from "../middleware/validate";
import { NotificationService } from "../services/NotificationService";

const router = Router();

// Create Intake Profile (Public) - Emails directly, does not save to DB
router.post("/", validate(createIntakeSchema), async (req, res): Promise<void> => {
  try {
    // Send intake data directly via email
    await NotificationService.sendIntakeSubmission(req.body);

    res.status(201).json({
      status: "success",
      message: "Client intake profile received and emailed successfully.",
      intake: req.body,
    });
  } catch (error) {
    console.error("Create intake profile error:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

export default router;
