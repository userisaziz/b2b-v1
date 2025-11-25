import express from "express";
const router = express.Router();

// Placeholder routes - to be implemented
router.get("/dashboard", (req, res) => {
  res.json({ message: "Employee Dashboard" });
});

export default router;