import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const companyEmployeeSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: [true, "Seller ID is required"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
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
      select: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
    },
    role: {
      type: String,
      enum: ["sales", "support", "catalog_manager", "inventory_manager"],
      required: [true, "Role is required"],
    },

    // Granular Permissions
    permissions: {
      // Product management
      canViewProducts: { type: Boolean, default: false },
      canAddProducts: { type: Boolean, default: false },
      canEditProducts: { type: Boolean, default: false },
      canDeleteProducts: { type: Boolean, default: false },

      // Order management
      canViewOrders: { type: Boolean, default: false },
      canProcessOrders: { type: Boolean, default: false },
      canCancelOrders: { type: Boolean, default: false },

      // Customer management
      canViewCustomers: { type: Boolean, default: false },
      canContactCustomers: { type: Boolean, default: false },

      // Inventory management
      canViewInventory: { type: Boolean, default: false },
      canUpdateInventory: { type: Boolean, default: false },

      // Analytics
      canViewAnalytics: { type: Boolean, default: false },
      canViewFinancials: { type: Boolean, default: false },

      // Settings
      canManageEmployees: { type: Boolean, default: false },
      canEditStoreSettings: { type: Boolean, default: false },
    },

    // Employee Status
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
    },
    lastLogin: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

// Indexes (only keep non-duplicate indexes)
companyEmployeeSchema.index({ sellerId: 1 });
companyEmployeeSchema.index({ status: 1 });

// Hash password before saving
companyEmployeeSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    this.password = await bcrypt.hash(this.password, 12);
  } catch (error) {
    return next(error);
  }
});

// Method to compare passwords
companyEmployeeSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Predefined role permissions
const rolePermissions = {
  sales: {
    canViewOrders: true,
    canProcessOrders: true,
    canViewCustomers: true,
    canContactCustomers: true,
    canViewProducts: true,
    canViewAnalytics: true,
  },
  support: {
    canViewOrders: true,
    canViewCustomers: true,
    canContactCustomers: true,
    canViewProducts: true,
  },
  catalog_manager: {
    canViewProducts: true,
    canAddProducts: true,
    canEditProducts: true,
    canDeleteProducts: true,
    canViewInventory: true,
    canUpdateInventory: true,
  },
  inventory_manager: {
    canViewProducts: true,
    canViewInventory: true,
    canUpdateInventory: true,
    canViewOrders: true,
  },
};

// Set default permissions based on role
companyEmployeeSchema.pre("save", function (next) {
  if (this.isNew && this.role) {
    const defaultPerms = rolePermissions[this.role];
    if (defaultPerms) {
      Object.assign(this.permissions, defaultPerms);
    }
  }
  next();
});

export const CompanyEmployee = mongoose.model("CompanyEmployee", companyEmployeeSchema);