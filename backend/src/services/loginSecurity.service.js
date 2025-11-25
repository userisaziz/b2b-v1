// ============================================
// services/loginSecurity.service.js
// AI-Powered Login Security Analysis
// ============================================
import { LoginAttempt } from "../models/loginAttempt.model.js";
import { SecurityAlert } from "../models/securityAlert.model.js";

/**
 * Analyze login attempt and calculate risk score
 */
export const analyzeLoginAttempt = async (attemptData) => {
    const { email, ipAddress, userType, success } = attemptData;
    const riskFactors = [];
    let riskScore = 0;

    // Get recent attempts for this email (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentAttempts = await LoginAttempt.find({
        email,
        createdAt: { $gte: oneDayAgo },
    }).sort({ createdAt: -1 });

    // Factor 1: Multiple failed attempts
    const failedAttempts = recentAttempts.filter((a) => !a.success);
    if (failedAttempts.length >= 5) {
        riskFactors.push({
            factor: "multiple_failed_attempts",
            severity: "high",
            description: `${failedAttempts.length} failed attempts in last 24 hours`,
        });
        riskScore += 40;
    } else if (failedAttempts.length >= 3) {
        riskFactors.push({
            factor: "multiple_failed_attempts",
            severity: "medium",
            description: `${failedAttempts.length} failed attempts in last 24 hours`,
        });
        riskScore += 20;
    }

    // Factor 2: Multiple IPs for same email
    const uniqueIPs = new Set(recentAttempts.map((a) => a.ipAddress));
    if (uniqueIPs.size >= 5) {
        riskFactors.push({
            factor: "multiple_ips",
            severity: "high",
            description: `Login attempts from ${uniqueIPs.size} different IPs`,
        });
        riskScore += 35;
    } else if (uniqueIPs.size >= 3) {
        riskFactors.push({
            factor: "multiple_ips",
            severity: "medium",
            description: `Login attempts from ${uniqueIPs.size} different IPs`,
        });
        riskScore += 15;
    }

    // Factor 3: Rapid succession attempts (potential brute force)
    if (recentAttempts.length >= 10) {
        const timeSpan =
            recentAttempts[0].createdAt - recentAttempts[recentAttempts.length - 1].createdAt;
        const minutesSpan = timeSpan / (1000 * 60);

        if (minutesSpan < 5) {
            riskFactors.push({
                factor: "brute_force_pattern",
                severity: "critical",
                description: `${recentAttempts.length} attempts in ${minutesSpan.toFixed(1)} minutes`,
            });
            riskScore += 50;
        } else if (minutesSpan < 15) {
            riskFactors.push({
                factor: "rapid_attempts",
                severity: "high",
                description: `${recentAttempts.length} attempts in ${minutesSpan.toFixed(1)} minutes`,
            });
            riskScore += 30;
        }
    }

    // Factor 4: Admin account protection (higher scrutiny)
    if (userType === "admin") {
        riskScore += 10; // Base increase for admin attempts
        if (!success && failedAttempts.length >= 2) {
            riskFactors.push({
                factor: "admin_account_targeted",
                severity: "high",
                description: "Failed login attempts on admin account",
            });
            riskScore += 25;
        }
    }

    // Factor 5: Unusual time (optional - between 2 AM and 5 AM)
    const hour = new Date().getHours();
    if (hour >= 2 && hour < 5) {
        riskFactors.push({
            factor: "unusual_time",
            severity: "low",
            description: "Login attempt during unusual hours (2-5 AM)",
        });
        riskScore += 5;
    }

    // Cap risk score at 100
    riskScore = Math.min(riskScore, 100);

    return {
        riskScore,
        riskFactors,
        shouldBlock: riskScore >= 80,
        shouldAlert: riskScore >= 60,
    };
};

/**
 * Log login attempt with security analysis
 */
export const logLoginAttempt = async (attemptData, req) => {
    try {
        // Extract IP and User Agent
        const ipAddress =
            req.headers["x-forwarded-for"]?.split(",")[0] || req.connection.remoteAddress || "unknown";
        const userAgent = req.headers["user-agent"] || "unknown";

        // Perform security analysis
        const analysis = await analyzeLoginAttempt({
            ...attemptData,
            ipAddress,
        });

        // Create login attempt record
        const loginAttempt = await LoginAttempt.create({
            ...attemptData,
            ipAddress,
            userAgent,
            riskScore: analysis.riskScore,
            riskFactors: analysis.riskFactors,
            blocked: analysis.shouldBlock,
        });

        // Create security alert if needed
        if (analysis.shouldAlert) {
            await createSecurityAlert(loginAttempt, analysis);
        }

        return {
            loginAttempt,
            analysis,
        };
    } catch (error) {
        console.error("[SECURITY] Error logging login attempt:", error);
        // Don't throw - security logging shouldn't break login flow
        return null;
    }
};

/**
 * Create security alert for suspicious activity
 */
const createSecurityAlert = async (loginAttempt, analysis) => {
    try {
        let alertType = "high_risk_login";
        let severity = "medium";

        // Determine alert type and severity based on risk factors
        const hasMultipleFailures = analysis.riskFactors.some(
            (f) => f.factor === "multiple_failed_attempts"
        );
        const hasBruteForce = analysis.riskFactors.some((f) => f.factor === "brute_force_pattern");
        const isAdminTargeted = analysis.riskFactors.some((f) => f.factor === "admin_account_targeted");

        if (hasBruteForce) {
            alertType = "brute_force_detected";
            severity = "critical";
        } else if (isAdminTargeted) {
            alertType = "account_takeover_attempt";
            severity = "high";
        } else if (hasMultipleFailures) {
            alertType = "multiple_failed_attempts";
            severity = "high";
        }

        if (analysis.riskScore >= 80) {
            severity = "critical";
        } else if (analysis.riskScore >= 60) {
            severity = "high";
        }

        await SecurityAlert.create({
            alertType,
            severity,
            email: loginAttempt.email,
            userType: loginAttempt.userType,
            userId: loginAttempt.userId,
            ipAddress: loginAttempt.ipAddress,
            description: `High-risk login attempt detected (Risk Score: ${analysis.riskScore})`,
            details: {
                riskScore: analysis.riskScore,
                riskFactors: analysis.riskFactors,
                userAgent: loginAttempt.userAgent,
            },
            loginAttemptId: loginAttempt._id,
        });

        console.log(
            `[SECURITY ALERT] ${alertType} - ${loginAttempt.email} - Risk: ${analysis.riskScore}`
        );
    } catch (error) {
        console.error("[SECURITY] Error creating alert:", error);
    }
};

/**
 * Check if IP or email should be blocked
 */
export const shouldBlockAttempt = async (email, ipAddress) => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Check recent blocked attempts
    const recentBlocked = await LoginAttempt.findOne({
        $or: [{ email }, { ipAddress }],
        blocked: true,
        createdAt: { $gte: oneHourAgo },
    });

    return !!recentBlocked;
};
