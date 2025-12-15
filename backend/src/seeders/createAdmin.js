import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { Admin } from '../models/admin.model.js';
import connectDB from '../config/database.js';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const createAdmin = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Hash the password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('password123', salt);
    console.log("hashedPassword", hashedPassword)
    // Create admin user object
    const adminUser = {
      name: 'Super Admin',
      email: 'admin@b2bmarket.com',
      password: hashedPassword,
      phone: '+966501234567',
      adminLevel: 'super_admin',
      permissions: {
        canApproveSeliers: true,
        canManageAdmins: true,
        canManageUsers: true,
        canManageProducts: true,
        canManageOrders: true,
        canViewAnalytics: true,
        canManageSettings: true
      },
      isActive: true
    };
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminUser.email });
    if (existingAdmin) {
      console.log('Admin user already exists with email:', adminUser.email);
      console.log('Admin ID:', existingAdmin._id);
      await mongoose.connection.close();
      process.exit(0);
    }
    
    // Create new admin user
    const newAdmin = new Admin(adminUser);
    await newAdmin.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('Admin ID:', newAdmin._id);
    console.log('Admin Name:', newAdmin.name);
    console.log('Admin Email:', newAdmin.email);
    
    // Close the connection
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

// Run the function
createAdmin();