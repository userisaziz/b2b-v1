import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const sellerSchema = new mongoose.Schema(
  {
    // Personal details
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
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Minimum 8 characters"],
      select: false,
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^(\+966|0)?5\d{8}$/, "Invalid Saudi phone number"],
    },

    profileImage: String,

    // Company / Business details
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },

    businessType: {
      type: String,
      enum: [
        "manufacturer",
        "distributor",
        "retailer",
        "wholesaler",
        "trading_establishment",
        "importer",
        "service_provider",
      ],
      required: [true, "Business type is required"],
    },

    // Saudi Address
    businessAddress: {
      street: { type: String },
      district: { type: String },
      city: { type: String },
      region: { type: String },
      postalCode: { type: String },
      country: { type: String, default: "Saudi Arabia" },
    },

    // ----------------------------
    // 🔵 OPTIONAL VERIFICATION FIELDS
    // ----------------------------

    crNumber: {
      type: String,
      unique: true,
      sparse: true, // allows multiple NULL values
      trim: true,
      match: [/^\d{10}$/, "CR Number must be 10 digits"],
    },

    taxNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      match: [/^\d{15}$/, "Tax number must be 15 digits"],
    },

    nationalId: {
      type: String,
      trim: true,
      match: [/^\d{10}$/, "National ID must be 10 digits"],
    },

    // Documents for future verification
    documents: [
      {
        type: {
          type: String,
          enum: [
            "cr_certificate",
            "tax_certificate",
            "id_proof",
            "maroof_certificate",
            "other",
          ],
        },
        url: String,
        fileName: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // ----------------------------
    // 🟢 Admin Approval (Operational)
    // ----------------------------
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    approvedAt: Date,
    rejectionReason: String,
    rejectedAt: Date,

    // ----------------------------
    // 🔵 Verification Status (Document + Business Verification)
    // ----------------------------
    isVerified: {
      type: Boolean,
      default: false,
    },

    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },

    // Ratings
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Account status
    isActive: {
      type: Boolean,
      default: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    lastLogin: Date,

    // Password reset
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

// Index
sellerSchema.index({ approvalStatus: 1 });

// Password hashing
sellerSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

sellerSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

sellerSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

 const Seller = mongoose.model("Seller", sellerSchema);
export default Seller;
