import express from "express";
import { 
    createBuyer, 
    getAllBuyers, 
    getBuyerById, 
    updateBuyer, 
    deactivateBuyer, 
    activateBuyer 
} from "../controllers/buyer.controller.js";

const router = express.Router();

// Create new buyer (register)
router.post("/create", createBuyer);

// Get all buyers
router.get("/", getAllBuyers);

// Get single buyer
router.get("/:id", getBuyerById);

// Update buyer
router.put("/:id", updateBuyer);

// Deactivate buyer
router.put("/:id/deactivate", deactivateBuyer);

// Activate buyer
router.put("/:id/activate", activateBuyer);

export default router;