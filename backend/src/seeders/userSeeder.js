import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { Admin } from '../models/admin.model.js';
import { Seller } from '../models/seller.model.js';
import { Buyer } from '../models/buyer.model.js';
import connectDB from '../config/database.js';

dotenv.config();

// Connect to database
connectDB();

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
};

const seedUsers = async () => {
  try {
    // Clear existing data
    await Admin.deleteMany();
    await Seller.deleteMany();
    await Buyer.deleteMany();
    
    // Hash passwords for all users
    const adminUsers = [
      {
        name: 'Super Admin',
        email: 'admin@b2bmarket.com',
        password: await hashPassword('password123'),
        phone: '+1234567890',
        adminLevel: 'super_admin',
        permissions: {
          canApproveSeliers: true,
          canManageAdmins: true,
          canManageUsers: true,
          canManageProducts: true,
          canManageOrders: true,
          canViewAnalytics: true,
          canManageSettings: true
        }
      }
    ];
    
    const sellerUsers = [
      {
        name: 'Seller One',
        email: 'seller1@example.com',
        password: await hashPassword('password123'),
        phone: '+1234567891',
        companyName: 'Tech Solutions Inc.',
        businessEmail: 'info@techsolutions.com',
        businessType: 'manufacturer',
        taxId: 'TAX123456',
        businessAddress: {
          street: '123 Tech Street',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          country: 'USA'
        },
        approvalStatus: 'approved',
        storeName: 'Tech Solutions Store',
        storeDescription: 'Your one-stop shop for tech solutions'
      },
      {
        name: 'Seller Two',
        email: 'seller2@example.com',
        password: await hashPassword('password123'),
        phone: '+1234567892',
        companyName: 'Global Distributors Ltd.',
        businessEmail: 'contact@globaldistributors.com',
        businessType: 'distributor',
        taxId: 'TAX789012',
        businessAddress: {
          street: '456 Distribution Ave',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        approvalStatus: 'approved',
        storeName: 'Global Distribution',
        storeDescription: 'Distributing quality products worldwide'
      },
      {
        name: 'Seller Three',
        email: 'seller3@example.com',
        password: await hashPassword('password123'),
        phone: '+1234567893',
        companyName: 'Retail Masters',
        businessEmail: 'support@retailmasters.com',
        businessType: 'retailer',
        taxId: 'TAX345678',
        businessAddress: {
          street: '789 Retail Road',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          country: 'USA'
        },
        approvalStatus: 'pending',
        storeName: 'Retail Masters Store',
        storeDescription: 'Retail excellence since 2010'
      },
      {
        name: 'Seller Four',
        email: 'seller4@example.com',
        password: await hashPassword('password123'),
        phone: '+1234567894',
        companyName: 'Wholesale Experts',
        businessEmail: 'sales@wholesaleexperts.com',
        businessType: 'wholesaler',
        taxId: 'TAX901234',
        businessAddress: {
          street: '101 Wholesale Blvd',
          city: 'Houston',
          state: 'TX',
          zipCode: '77001',
          country: 'USA'
        },
        approvalStatus: 'approved',
        storeName: 'Wholesale Experts',
        storeDescription: 'Wholesale prices, retail quality'
      }
    ];
    
    const buyerUsers = [
      {
        name: 'Buyer One',
        email: 'buyer1@example.com',
        password: await hashPassword('password123'),
        phone: '+1234567895'
      },
      {
        name: 'Buyer Two',
        email: 'buyer2@example.com',
        password: await hashPassword('password123'),
        phone: '+1234567896'
      },
      {
        name: 'Buyer Three',
        email: 'buyer3@example.com',
        password: await hashPassword('password123'),
        phone: '+1234567897'
      }
    ];
    
    // Insert admin users
    const createdAdmins = await Admin.insertMany(adminUsers);
    console.log(`Inserted ${createdAdmins.length} admin users`);
    
    // Insert seller users
    const createdSellers = await Seller.insertMany(sellerUsers);
    console.log(`Inserted ${createdSellers.length} seller users`);
    
    // Insert buyer users
    const createdBuyers = await Buyer.insertMany(buyerUsers);
    console.log(`Inserted ${createdBuyers.length} buyer users`);
    
    console.log('Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeder
seedUsers();