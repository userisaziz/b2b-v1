import Seller from "../models/seller.model.js";
import bcrypt from "bcryptjs";

// =====================================================
// 1. CREATE NEW SELLER (Register)
// =====================================================

export const createSeller = async (req, res) => {
    try {
        const { name, email, phone, companyName, businessType, password, crNumber, taxNumber } = req.body;

        // ✔ seller email must be unique (admin and seller CANNOT share email)
        const existingSeller = await Seller.findOne({ email });
        if (existingSeller) {
            return res.status(400).json({ message: "Seller with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newSeller = await Seller.create({
            name,
            email,
            phone,
            companyName,
            businessType,
            crNumber,
            taxNumber,
            password: hashedPassword,
            approvalStatus: "pending" // New sellers start with pending approval
        });

        res.status(201).json({
            message: "Seller registered successfully. Waiting for admin approval.",
            seller: newSeller
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// =====================================================
// 2. GET ALL SELLERS (admin)
// supports filter: ?approvalStatus=pending / approved / rejected
// =====================================================

export const getAllSellers = async (req, res) => {
    try {
        const { approvalStatus } = req.query;

        // if status filtering needed
        const query = approvalStatus ? { approvalStatus } : {};

        const sellers = await Seller.find(query).sort({ createdAt: -1 });

        res.json(sellers);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// =====================================================
// 3. GET SINGLE SELLER BY ID
// =====================================================

export const getSellerById = async (req, res) => {
    try {
        const seller = await Seller.findById(req.params.id);

        if (!seller) {
            return res.status(404).json({ message: "Seller not found" });
        }

        res.json(seller);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// =====================================================
// 4. GET AUTHENTICATED SELLER PROFILE
// =====================================================

export const getSellerProfile = async (req, res) => {
    try {
        // req.user is attached by the authentication middleware
        const seller = await Seller.findById(req.user._id).select("-password");
        
        if (!seller) {
            return res.status(404).json({ message: "Seller not found" });
        }

        res.json({
            success: true,
            seller
        });

    } catch (err) {
        res.status(500).json({ 
            success: false,
            error: err.message 
        });
    }
};