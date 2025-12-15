# Database Seeding Guide

This guide explains how to seed the database with sample data for development and testing purposes.

## Available Seed Scripts

We have several seeding scripts available:

1. **User Seeder** - Seeds admin, seller, and buyer users
   ```bash
   npm run seed
   ```

2. **Category Seeder** - Seeds product categories
   ```bash
   npm run seed:categories
   ```

3. **Product Seeder** - Seeds products (requires categories and sellers to exist)
   ```bash
   npm run seed:products
   ```

4. **Complete Seeder** - Seeds all data types in the correct order
   ```bash
   npm run seed:all
   ```

## Seeding Order

For proper data relationships, seed in this order:
1. Categories
2. Users (admins, sellers, buyers)
3. Products
4. RFQs
5. Messages

The `seed:all` script handles this automatically.

## Seeding Individual Components

### Seeding Categories
```bash
npm run seed:categories
```

### Seeding Users
```bash
npm run seed
```

### Seeding Products
```bash
npm run seed:products
```

Note: Products require existing categories and sellers. Run user and category seeders first.

## Complete Database Seeding
To seed all data types with proper relationships:
```bash
npm run seed:all
```

This will:
1. Clear all existing data
2. Seed admins, sellers, and buyers
3. Seed categories and subcategories
4. Seed products with proper category and seller references
5. Seed sample RFQs and messages

## Resetting Data
All seeders clear existing data of their respective types before inserting new data.

To completely reset your database:
```bash
npm run seed:all
```

## Sample Data Overview

### Admin Users
- Super Admin with full permissions
- Moderator Admin with limited permissions

### Seller Users
- Approved manufacturers, distributors, and retailers
- Various business types and verification statuses

### Buyer Users
- Verified and unverified buyers

### Categories
- Top-level categories: Electronics, Fashion, Home & Garden, Sports & Outdoors, Health & Beauty
- Subcategories for specific product types

### Products
- Electronics (phones, laptops, cameras)
- Fashion items (clothing, shoes)
- Home & Garden products

### RFQs
- Sample bulk purchase requests
- Category-specific sourcing requests

### Messages
- Buyer-seller communications
- Admin notifications

## Customization

To customize the seed data, modify the files in `src/seeders/`:
- `userSeeder.js` - User data
- `categorySeeder.js` - Category data
- `productSeeder.js` - Product data
- `completeSeeder.js` - All data types

Remember to maintain proper relationships between entities when modifying seed data.