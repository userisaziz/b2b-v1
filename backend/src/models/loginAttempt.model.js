import mongoose from "mongoose";

const loginAttemptSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            index: true,
        },
        userType: {
            type: String,
            enum: ["admin", "seller", "buyer", "employee"],
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "userType",
        },
        success: {
            type: Boolean,
            required: true,
        },
        ipAddress: {
            type: String,
            required: true,
            index: true,
        },
        userAgent: {
            type: String,
        },
        location: {
            country: String,
            city: String,
            coordinates: {
                latitude: Number,
                longitude: Number,
            },
        },
        failureReason: {
            type: String,
            enum: ["invalid_password", "user_not_found", "account_suspended", "account_pending", "other"],
        },
        riskScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        riskFactors: [
            {
                factor: String,
                severity: {
                    type: String,
                    enum: ["low", "medium", "high"],
                },
                description: String,
            },
        ],
        blocked: {
            type: Boolean,
            default: false,
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient querying
loginAttemptSchema.index({ email: 1, createdAt: -1 });
loginAttemptSchema.index({ ipAddress: 1, createdAt: -1 });
loginAttemptSchema.index({ success: 1, createdAt: -1 });
loginAttemptSchema.index({ riskScore: -1 });

export const LoginAttempt = mongoose.model("LoginAttempt", loginAttemptSchema);
