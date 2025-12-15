import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/product.model.js';
import Category from '../models/category.model.js';
import Seller from '../models/seller.model.js';
import connectDB from '../config/database.js';

dotenv.config();

// Connect to database
connectDB();

const seedProducts = async () => {
  try {
    // Clear existing products
    await Product.deleteMany();
    
    // Get categories and sellers for references
    const categories = await Category.find({});
    const sellers = await Seller.find({});
    
    if (categories.length === 0 || sellers.length === 0) {
      console.log('⚠️  Please seed categories and sellers first');
      process.exit(1);
    }
    
    // Create a map for easy reference
    const categoryMap = {};
    categories.forEach(category => {
      categoryMap[category.name] = category._id;
    });
    
    const sellerMap = {};
    sellers.forEach(seller => {
      sellerMap[seller.companyName] = seller._id;
    });
    
    // Sample products data
    const products = [
      // Electronics
      {
        name: "Samsung Galaxy S24 Ultra",
        description: "Flagship Android smartphone with 200MP camera",
        price: 1199.99,
        stock: 25,
        categories: [categoryMap["Mobile Phones"]],
        sku: "SAMSUNG-S24ULTRA-001",
        brand: "Samsung",
        sellerId: sellers[0]._id,
        status: "active",
        attributes: [
          { name: "Color", value: "Phantom Black", displayType: "color" },
          { name: "Storage", value: "256GB", unit: "GB" }
        ]
      },
      {
        name: "Dell XPS 13 Laptop",
        description: "Premium ultrabook with Intel Core i7 processor",
        price: 1299.99,
        stock: 15,
        categories: [categoryMap["Laptops"]],
        sku: "DELL-XPS13-001",
        brand: "Dell",
        sellerId: sellers[0]._id,
        status: "active",
        attributes: [
          { name: "Processor", value: "Intel Core i7" },
          { name: "RAM", value: "16", unit: "GB" },
          { name: "Storage", value: "512", unit: "GB" }
        ]
      },
      {
        name: "Canon EOS R5 Camera",
        description: "Professional mirrorless camera with 45MP sensor",
        price: 3299.99,
        stock: 8,
        categories: [categoryMap["Cameras"]],
        sku: "CANON-R5-001",
        brand: "Canon",
        sellerId: sellers[1]._id,
        status: "active",
        attributes: [
          { name: "Megapixels", value: "45", unit: "MP" },
          { name: "Sensor Type", value: "Full Frame" }
        ]
      },
      
      // Fashion
      {
        name: "Adidas Ultraboost Running Shoes",
        description: "High-performance running shoes with Boost technology",
        price: 179.99,
        stock: 50,
        categories: [categoryMap["Sports & Outdoors"]],
        sku: "ADIDAS-UB-001",
        brand: "Adidas",
        sellerId: sellers[1]._id,
        status: "active",
        attributes: [
          { name: "Size", value: "10", unit: "US" },
          { name: "Color", value: "Core Black" }
        ]
      },
      {
        name: "Levi's 501 Original Jeans",
        description: "Classic straight fit jeans",
        price: 89.99,
        stock: 100,
        categories: [categoryMap["Men's Clothing"]],
        sku: "LEVIS-501-001",
        brand: "Levi's",
        sellerId: sellers[1]._id,
        status: "active",
        attributes: [
          { name: "Size", value: "32x32" },
          { name: "Color", value: "Mid Stonewash" }
        ]
      },
      
      // Home & Garden
      {
        name: "Dyson V15 Detect Vacuum Cleaner",
        description: "Cordless vacuum with laser detection technology",
        price: 699.99,
        stock: 20,
        categories: [categoryMap["Home & Garden"]],
        sku: "DYSON-V15-001",
        brand: "Dyson",
        sellerId: sellers[0]._id,
        status: "active",
        attributes: [
          { name: "Battery Life", value: "60", unit: "minutes" },
          { name: "Filtration", value: "HEPA" }
        ]
      }
    ];
    
    // Insert products
    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Inserted ${createdProducts.length} products`);
    
    console.log('🌱 Product seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
};

// Run the seeder
seedProducts();