import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const MONGO_URI = 'mongodb://localhost:27017/sauqmart'

// ----------------------
// Category Schema
// ----------------------
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
  createdAt: { type: Date, default: Date.now },
});

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);

// ----------------------
// Seed Data
// ----------------------
const SEED_CATEGORIES = [
  { name: "Electronics", slug: "electronics" },
  { name: "Mobiles", slug: "mobiles", parent: "Electronics" },
  { name: "Laptops", slug: "laptops", parent: "Electronics" },
  { name: "Cameras", slug: "cameras", parent: "Electronics" },

  { name: "Fashion", slug: "fashion" },
  { name: "Men", slug: "men", parent: "Fashion" },
  { name: "Women", slug: "women", parent: "Fashion" },
  { name: "Kids", slug: "kids", parent: "Fashion" },
];

async function connectDB() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ MongoDB connected");
}

async function clearCategories() {
  await Category.deleteMany({});
  console.log("🗑️  Existing categories removed");
}

async function importCategories() {
  const topLevel = SEED_CATEGORIES.filter(c => !c.parent);
  const insertedTop = await Category.insertMany(topLevel);

  const nameMap = {};
  insertedTop.forEach(doc => nameMap[doc.name] = doc._id);

  const children = SEED_CATEGORIES.filter(c => c.parent).map(c => ({
    name: c.name,
    slug: c.slug,
    parentId: nameMap[c.parent]
  }));

  await Category.insertMany(children);
  console.log("✨ Categories seeded");
}

(async () => {
  try {
    await connectDB();

    if (process.argv.includes("--destroy")) {
      await clearCategories();
      process.exit(0);
    }

    await clearCategories();
    await importCategories();

    console.log("🌱 Seed completed");
    process.exit(0);
  } catch (err) {
    console.log("❌ Seeder Error:", err);
    process.exit(1);
  }
})();
