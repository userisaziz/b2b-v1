import Category from "../models/category.model.js";
import cloudinary from "../config/cloudinary.js";

// =======================================================
// Upload Helper
// =======================================================
async function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "categories" }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(buffer);
  });
}

// =======================================================
// CREATE CATEGORY (Admin) - WITH IMAGE UPLOAD
// =======================================================
export const createCategory = async (req, res) => {
  try {
    const {
      name,
      slug,
      parentId,
      description,
      metadata
    } = req.body;
    console.log(parentId,"parentId");
    console.log(req.body,"req.body");

    let parentCategory = null;
    let level = 0;
    let path = `/${slug}`;
    let ancestors = [];

    // ---------- Check Parent ----------
    if (parentId) {
      parentCategory = await Category.findById(parentId);
      if (!parentCategory) {
        return res.status(400).json({ message: "Parent category not found" });
      }

      level = parentCategory.level + 1;
      path = `${parentCategory.path}/${slug}`;
      ancestors = [
        ...parentCategory.ancestors,
        { id: parentCategory._id, name: parentCategory.name, slug: parentCategory.slug }
      ];
    }

    // ---------- Handle Cloudinary Upload ----------
    let imageUrl = null;
    if (req.file) {
      const upload = await uploadToCloudinary(req.file.buffer);
      imageUrl = upload.secure_url;
    }

    // ---------- Create Category ----------
    const category = await Category.create({
      name,
      slug,
      parentId,
      level,
      path,
      ancestors,
      description,
      imageUrl,
      metadata,
      createdBy: req.user._id
    });

    // ---------- Update parent children count ----------
    if (parentId) {
      await Category.findByIdAndUpdate(parentId, {
        $inc: { "stats.childrenCount": 1 }
      });
    }

    return res.status(201).json({
      message: "Category created successfully",
      category
    });
  } catch (err) {
    console.error("Create Category Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// =======================================================
// UPDATE CATEGORY (Admin) - WITH IMAGE UPLOAD
// =======================================================
export const updateCategory = async (req, res) => {
  try {
    const updates = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    // ---------- Replace Image ----------
    if (req.file) {
      const upload = await uploadToCloudinary(req.file.buffer);
      updates.imageUrl = upload.secure_url;
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    return res.json({
      message: "Category updated",
      category: updatedCategory
    });
  } catch (err) {
    console.error("Update Category Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// =======================================================
// DELETE CATEGORY
// =======================================================
export const deleteCategory = async (req, res, ) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    // Find all descendant categories (children, grandchildren, etc.)
    const getAllDescendants = async (parentId) => {
      const children = await Category.find({ parentId: parentId });
      let allDescendants = [...children];
      
      // Recursively get descendants of each child
      for (const child of children) {
        const descendants = await getAllDescendants(child._id);
        allDescendants = [...allDescendants, ...descendants];
      }
      
      return allDescendants;
    };

    // Get all descendant categories
    const descendants = await getAllDescendants(category._id);
    
    // Delete all descendant categories
    const descendantIds = descendants.map(desc => desc._id);
    if (descendantIds.length > 0) {
      await Category.deleteMany({ _id: { $in: descendantIds } });
    }

    // Delete the category itself
    await Category.findByIdAndDelete(req.params.id);

    // Update parent's children count if this category had a parent
    if (category.parentId) {
      // Get the count of remaining children for the parent
      const remainingChildrenCount = await Category.countDocuments({ parentId: category.parentId });
      await Category.findByIdAndUpdate(category.parentId, {
        $set: { "stats.childrenCount": remainingChildrenCount }
      });
    }

    res.json({ 
      message: "Category and all its subcategories deleted successfully",
      deletedCount: descendantIds.length + 1 // +1 for the parent category itself
    });
  } catch (err) {
    console.error("Delete Category Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// =======================================================
// GET ALL CATEGORIES
// =======================================================
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ displayOrder: 1 });
    
    // Build hierarchical structure
    const categoryMap = {};
    const rootCategories = [];
    
    // Create a map of all categories by their ID
    categories.forEach(category => {
      categoryMap[category._id.toString()] = {
        ...category.toObject(),
        children: []
      };
    });
    
    // Build the tree structure
    categories.forEach(category => {
      const cat = categoryMap[category._id.toString()];
      if (category.parentId) {
        const parent = categoryMap[category.parentId.toString()];
        if (parent) {
          parent.children.push(cat);
        } else {
          // Parent not found, treat as root
          rootCategories.push(cat);
        }
      } else {
        // Root category
        rootCategories.push(cat);
      }
    });
    
    res.json(rootCategories);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// =======================================================
// GET CATEGORY BY ID
// =======================================================
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    
    // Get children categories
    const children = await Category.find({ parentId: category._id });
    
    // Add children to the category object
    const categoryWithChildren = {
      ...category.toObject(),
      children
    };
    
    res.json(categoryWithChildren);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};