import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
    },
    // Admin specific fields
    adminLevel: {
      type: String,
      enum: ["super_admin", "admin", "moderator"],
      default: "admin",
    },
    permissions: {
      canApproveSeliers: { type: Boolean, default: true },
      canManageAdmins: { type: Boolean, default: false },
      canManageUsers: { type: Boolean, default: true },
      canManageProducts: { type: Boolean, default: true },
      canManageOrders: { type: Boolean, default: true },
      canViewAnalytics: { type: Boolean, default: true },
      canManageSettings: { type: Boolean, default: false },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin", 
    },
  },
  { timestamps: true }
);

// Indexes (only keep non-duplicate indexes)
adminSchema.index({ adminLevel: 1 });

// Hash password before saving
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
adminSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const Admin = mongoose.model("Admin", adminSchema);