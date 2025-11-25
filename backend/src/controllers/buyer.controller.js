import { Buyer } from "../models/buyer.model.js";

// =====================================================
// 1. GET ALL BUYERS (admin)
// supports filter: ?status=active / inactive
// =====================================================

export const getAllBuyers = async (req, res) => {
    try {
        const { status } = req.query;

        // if status filtering needed
        const query = status ? { status } : {};

        const buyers = await Buyer.find(query).sort({ createdAt: -1 });

        res.json(buyers);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// =====================================================
// 2. GET SINGLE BUYER BY ID
// =====================================================

export const getBuyerById = async (req, res) => {
    try {
        const buyer = await Buyer.findById(req.params.id);

        if (!buyer) {
            return res.status(404).json({ message: "Buyer not found" });
        }

        res.json(buyer);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// =====================================================
// 3. CREATE NEW BUYER (Register)
// =====================================================

export const createBuyer = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // ✔ buyer email must be unique
        const existingBuyer = await Buyer.findOne({ email });
        if (existingBuyer) {
            return res.status(400).json({ message: "Buyer with this email already exists" });
        }

        const newBuyer = await Buyer.create({
            name,
            email,
            phone,
            password
        });

        res.status(201).json({
            message: "Buyer registered successfully",
            buyer: newBuyer
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// =====================================================
// 4. UPDATE BUYER
// =====================================================

export const updateBuyer = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Remove password from updates for security
        delete updates.password;

        const buyer = await Buyer.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        if (!buyer) {
            return res.status(404).json({ message: "Buyer not found" });
        }

        res.json({
            message: "Buyer updated successfully",
            buyer
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// =====================================================
// 5. DEACTIVATE BUYER
// =====================================================

export const deactivateBuyer = async (req, res) => {
    try {
        const { id } = req.params;

        const buyer = await Buyer.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!buyer) {
            return res.status(404).json({ message: "Buyer not found" });
        }

        res.json({
            message: "Buyer deactivated successfully",
            buyer
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// =====================================================
// 6. ACTIVATE BUYER
// =====================================================

export const activateBuyer = async (req, res) => {
    try {
        const { id } = req.params;

        const buyer = await Buyer.findByIdAndUpdate(
            id,
            { isActive: true },
            { new: true }
        );

        if (!buyer) {
            return res.status(404).json({ message: "Buyer not found" });
        }

        res.json({
            message: "Buyer activated successfully",
            buyer
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};