import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { Admin } from '../models/admin.model.js';
import Seller from '../models/seller.model.js';
import { Buyer } from '../models/buyer.model.js';
import Category from '../models/category.model.js';
import Product from '../models/product.model.js';
import RFQ from '../models/rfq.model.js';
import Message from '../models/message.model.js';
import connectDB from '../config/database.js';

dotenv.config();

// Connect to database
connectDB();

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
};

const seedDatabase = async () => {
  try {
    // Clear existing data
    await Admin.deleteMany();
    await Seller.deleteMany();
    await Buyer.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await RFQ.deleteMany();
    await Message.deleteMany();
    
    console.log('🗑️  Existing data removed');
    
    // Create Admin users
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
      },
      {
        name: 'Moderator Admin',
        email: 'moderator@b2bmarket.com',
        password: await hashPassword('password123'),
        phone: '+1234567891',
        adminLevel: 'moderator',
        permissions: {
          canApproveSeliers: true,
          canManageAdmins: false,
          canManageUsers: true,
          canManageProducts: true,
          canManageOrders: true,
          canViewAnalytics: false,
          canManageSettings: false
        }
      }
    ];
    
    const createdAdmins = await Admin.insertMany(adminUsers);
    console.log(`✅ Inserted ${createdAdmins.length} admin users`);
    
    // Create Seller users
    const sellerUsers = [
      {
        name: 'Tech Solutions Inc.',
        email: 'techsolutions@example.com',
        password: await hashPassword('password123'),
        phone: '+1234567892',
        companyName: 'Tech Solutions Inc.',
        businessType: 'manufacturer',
        businessAddress: {
          street: '123 Tech Street',
          city: 'San Francisco',
          region: 'CA',
          postalCode: '94102',
          country: 'USA'
        },
        approvalStatus: 'approved',
        isVerified: true
      },
      {
        name: 'Global Distributors Ltd.',
        email: 'globaldistributors@example.com',
        password: await hashPassword('password123'),
        phone: '+1234567893',
        companyName: 'Global Distributors Ltd.',
        businessType: 'distributor',
        businessAddress: {
          street: '456 Distribution Ave',
          city: 'New York',
          region: 'NY',
          postalCode: '10001',
          country: 'USA'
        },
        approvalStatus: 'approved',
        isVerified: true
      },
      {
        name: 'Retail Masters',
        email: 'retailmasters@example.com',
        password: await hashPassword('password123'),
        phone: '+1234567894',
        companyName: 'Retail Masters',
        businessType: 'retailer',
        businessAddress: {
          street: '789 Retail Road',
          city: 'Chicago',
          region: 'IL',
          postalCode: '60601',
          country: 'USA'
        },
        approvalStatus: 'pending',
        isVerified: false
      }
    ];
    
    const createdSellers = await Seller.insertMany(sellerUsers);
    console.log(`✅ Inserted ${createdSellers.length} seller users`);
    
    // Create Buyer users
    const buyerUsers = [
      {
        name: 'John Buyer',
        email: 'john.buyer@example.com',
        password: await hashPassword('password123'),
        phone: '+1234567895',
        isVerified: true
      },
      {
        name: 'Jane Customer',
        email: 'jane.customer@example.com',
        password: await hashPassword('password123'),
        phone: '+1234567896',
        isVerified: true
      },
      {
        name: 'Corporate Buyer',
        email: 'corp.buyer@example.com',
        password: await hashPassword('password123'),
        phone: '+1234567897',
        isVerified: false
      }
    ];
    
    const createdBuyers = await Buyer.insertMany(buyerUsers);
    console.log(`✅ Inserted ${createdBuyers.length} buyer users`);
    
    // Create Categories
    const topLevelCategories = [
      { name: "Electronics", slug: "electronics" },
      { name: "Fashion", slug: "fashion" },
      { name: "Home & Garden", slug: "home-garden" },
      { name: "Sports & Outdoors", slug: "sports-outdoors" },
      { name: "Health & Beauty", slug: "health-beauty" }
    ];
    
    const insertedCategories = await Category.insertMany(topLevelCategories);
    const categoryMap = {};
    insertedCategories.forEach(cat => categoryMap[cat.name] = cat._id);
    
    // Create Subcategories
    const subCategories = [
      { name: "Mobile Phones", slug: "mobile-phones", parentId: categoryMap["Electronics"] },
      { name: "Laptops", slug: "laptops", parentId: categoryMap["Electronics"] },
      { name: "Cameras", slug: "cameras", parentId: categoryMap["Electronics"] },
      { name: "Men's Clothing", slug: "mens-clothing", parentId: categoryMap["Fashion"] },
      { name: "Women's Clothing", slug: "womens-clothing", parentId: categoryMap["Fashion"] },
      { name: "Children's Wear", slug: "children-wear", parentId: categoryMap["Fashion"] }
    ];
    
    await Category.insertMany(subCategories);
    console.log(`✅ Inserted ${topLevelCategories.length + subCategories.length} categories`);
    
    // Create Products
    const products = [
      {
        name: "iPhone 15 Pro",
        description: "Latest Apple iPhone with advanced camera system",
        price: 999.99,
        stock: 50,
        categories: [categoryMap["Mobile Phones"]],
        sku: "IPH15PRO-001",
        brand: "Apple",
        sellerId: createdSellers[0]._id,
        status: "active",
        attributes: [
          { name: "Color", value: "Titanium", unit: "", displayType: "color", isSearchable: true, isFilterable: true },
          { name: "Storage", value: "256GB", unit: "GB", displayType: "text", isSearchable: true, isFilterable: true }
        ]
      },
      {
        name: "MacBook Air M2",
        description: "Ultra-thin laptop with M2 chip",
        price: 1199.99,
        stock: 30,
        categories: [categoryMap["Laptops"]],
        sku: "MACAIR-M2-001",
        brand: "Apple",
        sellerId: createdSellers[0]._id,
        status: "active",
        attributes: [
          { name: "RAM", value: "8", unit: "GB", displayType: "number", isSearchable: true, isFilterable: true },
          { name: "Storage", value: "256", unit: "GB", displayType: "number", isSearchable: true, isFilterable: true }
        ]
      },
      {
        name: "Nike Running Shoes",
        description: "Lightweight running shoes for athletes",
        price: 129.99,
        stock: 100,
        categories: [categoryMap["Sports & Outdoors"]],
        sku: "NIKE-RUN-001",
        brand: "Nike",
        sellerId: createdSellers[1]._id,
        status: "active",
        attributes: [
          { name: "Size", value: "9", unit: "US", displayType: "size", isSearchable: true, isFilterable: true },
          { name: "Color", value: "Black", unit: "", displayType: "color", isSearchable: true, isFilterable: true }
        ]
      }
    ];
    
    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Inserted ${createdProducts.length} products`);
    
    // Create RFQs
    const rfqs = [
      {
        title: "Bulk Order for Office Supplies",
        description: "Looking for bulk purchase of office supplies including pens, paper, and staplers",
        quantity: 1000,
        budget_min: 500,
        budget_max: 1000,
        delivery_location: "New York, NY",
        deadline: new Date(Date.now() + 30*24*60*60*1000), // 30 days from now
        buyerId: createdBuyers[0]._id,
        status: "open",
        distributionType: "all"
      },
      {
        title: "Custom Electronics Components",
        description: "Need custom electronic components for manufacturing",
        categoryId: categoryMap["Electronics"],
        quantity: 5000,
        budget_min: 10000,
        budget_max: 15000,
        delivery_location: "Los Angeles, CA",
        deadline: new Date(Date.now() + 60*24*60*60*1000), // 60 days from now
        buyerId: createdBuyers[1]._id,
        status: "open",
        distributionType: "category"
      }
    ];
    
    const createdRFQs = await RFQ.insertMany(rfqs);
    console.log(`✅ Inserted ${createdRFQs.length} RFQs`);
    
    // Create Messages
    const messages = [
      {
        sender_id: createdBuyers[0]._id,
        recipient_id: createdSellers[0]._id,
        sender_type: "Buyer",
        recipient_type: "Seller",
        subject: "Inquiry about iPhone 15 Pro",
        message: "Hi, I'm interested in purchasing iPhone 15 Pro in bulk. Can you provide wholesale pricing?",
        message_type: "general",
        status: "unread"
      },
      {
        sender_id: createdSellers[0]._id,
        recipient_id: createdBuyers[0]._id,
        sender_type: "Seller",
        recipient_type: "Buyer",
        subject: "Re: Inquiry about iPhone 15 Pro",
        message: "Hello, thank you for your interest. We can offer a 10% discount for orders above 50 units.",
        message_type: "general",
        status: "unread"
      },
      {
        sender_id: createdAdmins[0]._id,
        recipient_id: createdSellers[1]._id,
        sender_type: "Admin",
        recipient_type: "Seller",
        subject: "Account Verification Required",
        message: "Please submit your business registration documents to complete the verification process.",
        message_type: "support",
        status: "unread"
      }
    ];
    
    const createdMessages = await Message.insertMany(messages);
    console.log(`✅ Inserted ${createdMessages.length} messages`);
    
    console.log('🌱 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeder
seedDatabase();