import mongoose from "mongoose";

const securityAlertSchema = new mongoose.Schema(
    {
        alertType: {
            type: String,
            required: true,
            enum: [
                "multiple_failed_attempts",
                "suspicious_location",
                "unusual_time",
                "new_device",
                "brute_force_detected",
                "account_takeover_attempt",
                "high_risk_login",
            ],
        },
        severity: {
            type: String,
            required: true,
            enum: ["low", "medium", "high", "critical"],
            default: "medium",
        },
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
        ipAddress: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        details: {
            type: mongoose.Schema.Types.Mixed,
        },
        loginAttemptId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LoginAttempt",
        },
        status: {
            type: String,
            enum: ["open", "investigating", "resolved", "false_positive"],
            default: "open",
        },
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
        },
        resolvedAt: {
            type: Date,
        },
        notes: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
securityAlertSchema.index({ email: 1, createdAt: -1 });
securityAlertSchema.index({ severity: 1, status: 1 });
securityAlertSchema.index({ alertType: 1, createdAt: -1 });

export const SecurityAlert = mongoose.model("SecurityAlert", securityAlertSchema);
