import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const buyerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false  // Don't return password in queries by default
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        match: [/^[0-9+\-\s()]+$/, 'Please provide a valid phone number']
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true  // Automatically adds createdAt and updatedAt
});

// Hash password before saving
buyerSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        this.password = await bcrypt.hash(this.password, 12);
    } catch (error) {
        return next(error);
    }
});

// Method to compare passwords
buyerSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Add isActive field for consistency with other models
buyerSchema.virtual('isActive').get(function() {
    return true; // Buyers are always active
});

export const Buyer = mongoose.model('Buyer', buyerSchema);

