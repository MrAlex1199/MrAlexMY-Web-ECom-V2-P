import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import cors from "cors";
import jwt from "jsonwebtoken";
import "dotenv/config";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import chalk from "chalk";
import { v2 as cloudinary } from "cloudinary";

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Configure Multer
const upload = multer({ dest: join(__dirname, "uploads/") });

const app = express();
const mongoURI = process.env.MONGO || "";
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Connect to MongoDB
mongoose
  .connect(mongoURI)
  .then(() => {
    console.log(chalk.green("MongoDB connected successfully to database"));
  })
  .catch((err) => {
    console.error(chalk.red("Error connecting to MongoDB:", err));
  });

// User schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  password: { type: String, required: true },
  selectedProducts: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, default: 1 },
      selectedColor: { type: String, required: true },
      selectedSize: { type: String, required: true },
    },
  ],
  address: [
    {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      address: { type: String, required: true },
      phone: { type: String, required: true },
      age: { type: Number, required: true },
    },
  ],
}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

const User = mongoose.model("User", userSchema);

// **** START OF CORRECTED ADMIN AUTH SYSTEM ****
// Standardized Admin schema
const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  employeeID: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  role: { type: String, default: "admin" },
}, { timestamps: true });

// Corrected pre-save hook for admin password hashing
adminSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

const Admin = mongoose.model("Admin", adminSchema);
// **** END OF CORRECTED ADMIN AUTH SYSTEM ****


// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stock_remaining: { type: Number, required: true },
  stock_reserved: { type: Number, default: 0 },
  href: { type: String },
  imageSrc: { type: String, required: true },
  imageAlt: { type: String },
  breadcrumbs: { type: String },
  images: [{ src: String, alt: String }],
  description: { type: String },
  colors: [{ name: String, class: String, selectedClass: String }],
  sizes: [{ name: String, inStock: Boolean }],
  highlights: [String],
  details: String,
  discount: { type: Number, default: 0 },
  reviewsAvg: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  reviewsHref: { type: String, default: "#" },
  comments: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, required: true }, // Keep name for anonymous or non-logged-in users
      comment: { type: String, required: true },
      reviewImg: [{ type: String }],
      rating: { type: Number, default: 0 },
      date: { type: Date, default: Date.now },
    },
  ],
  stock_history: [
    {
      action: { type: String, enum: ['deducted', 'refunded', 'reserved', 'unreserved'], required: true },
      quantity: { type: Number, required: true },
      orderId: { type: String },
      reason: { type: String },
      timestamp: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

// Order schema
const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productSelected: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  estDelivery: { type: Date, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  deliveryPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  payment: { type: String, required: true },
  shippingAddress: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      address: { type: String, required: true },
      phone: { type: String, required: true },
  },
  trackingCode: { type: String, required: true },
  lastLocation: { type: String, required: true },
  carrier: { type: String, required: true },
  status: { type: String, required: true, default: 'In Transit' },
}, { timestamps: true });


const Order = mongoose.model("Order", OrderSchema);

// ==================== STOCK MANAGEMENT HELPER FUNCTIONS ====================

// Validate stock availability before checkout
async function validateStockAvailability(productSelected) {
  const errors = [];
  for (const item of productSelected) {
    const product = await Product.findById(item.productId);
    if (!product) {
      errors.push({ 
        productId: item.productId, 
        error: "Product not found",
        requested: item.quantity,
        available: 0,
      });
      continue;
    }
    
    // Check if quantity is valid
    if (!item.quantity || item.quantity <= 0) {
      errors.push({
        productId: item.productId,
        productName: product.name,
        requested: item.quantity,
        available: product.stock_remaining,
        error: "Invalid quantity",
      });
      continue;
    }
    
    // Calculate available stock (remaining - reserved)
    const availableStock = product.stock_remaining - product.stock_reserved;
    
    // Strict validation: stock must be positive and >= requested quantity
    if (product.stock_remaining <= 0 || availableStock < item.quantity) {
      errors.push({
        productId: item.productId,
        productName: product.name,
        requested: item.quantity,
        available: Math.max(0, availableStock),
        remaining: product.stock_remaining,
        error: `Insufficient stock for ${product.name}. Available: ${Math.max(0, availableStock)} units`,
      });
    }
  }
  return errors;
}

// Double-check stock before final deduction (prevents race conditions)
async function verifyStockBeforeDeduction(productSelected) {
  const errors = [];
  for (const item of productSelected) {
    const product = await Product.findById(item.productId);
    if (!product) {
      errors.push({ 
        productId: item.productId, 
        error: "Product no longer available",
      });
      continue;
    }
    
    // Ensure we never go negative
    if (product.stock_remaining < item.quantity) {
      errors.push({
        productId: item.productId,
        productName: product.name,
        requested: item.quantity,
        available: product.stock_remaining,
        error: `Stock depleted. Only ${product.stock_remaining} remaining.`,
      });
    }
  }
  return errors;
}

// Reserve stock during checkout (holds inventory temporarily)
async function reserveStock(productSelected, orderId) {
  try {
    for (const item of productSelected) {
      await Product.findByIdAndUpdate(
        item.productId,
        {
          $inc: { stock_reserved: item.quantity },
          $push: {
            stock_history: {
              action: "reserved",
              quantity: item.quantity,
              orderId: orderId,
              reason: "Reserved during checkout",
            },
          },
        },
        { new: true }
      );
    }
  } catch (error) {
    console.error(chalk.red("Error reserving stock:", error));
    throw error;
  }
}

// Deduct stock from inventory (when order is confirmed)
async function deductStock(productSelected, orderId) {
  try {
    for (const item of productSelected) {
      await Product.findByIdAndUpdate(
        item.productId,
        {
          $inc: {
            stock_remaining: -item.quantity,
            stock_reserved: -item.quantity,
          },
          $push: {
            stock_history: {
              action: "deducted",
              quantity: item.quantity,
              orderId: orderId,
              reason: "Order confirmed and paid",
            },
          },
        },
        { new: true }
      );
    }
  } catch (error) {
    console.error(chalk.red("Error deducting stock:", error));
    throw error;
  }
}

// Restore stock (when order is cancelled or failed)
async function restoreStock(productSelected, orderId, reason = "Order cancelled") {
  try {
    for (const item of productSelected) {
      await Product.findByIdAndUpdate(
        item.productId,
        {
          $inc: { stock_reserved: -item.quantity },
          $push: {
            stock_history: {
              action: "unreserved",
              quantity: item.quantity,
              orderId: orderId,
              reason: reason,
            },
          },
        },
        { new: true }
      );
    }
  } catch (error) {
    console.error(chalk.red("Error restoring stock:", error));
    throw error;
  }
}

// Fully restore stock (when order is refunded)
async function refundStock(productSelected, orderId, reason = "Order refunded") {
  try {
    for (const item of productSelected) {
      await Product.findByIdAndUpdate(
        item.productId,
        {
          $inc: { stock_remaining: item.quantity },
          $push: {
            stock_history: {
              action: "refunded",
              quantity: item.quantity,
              orderId: orderId,
              reason: reason,
            },
          },
        },
        { new: true }
      );
    }
  } catch (error) {
    console.error(chalk.red("Error refunding stock:", error));
    throw error;
  }
}

// ==================== END OF STOCK MANAGEMENT FUNCTIONS ====================

// Endpoint to get all orders for admin dashboard
app.get("/admin/orders", async (req, res) => {
  try {
    const orders = await Order.find().populate('userId', 'fname lname').populate('productSelected.productId', 'imageSrc');
    res.status(200).json(orders);
  } catch (error) {
    console.error(chalk.red(error));
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// Endpoint to validate stock availability (before checkout)
app.post("/api/validate-stock", async (req, res) => {
  try {
    const { productSelected } = req.body;

    if (!productSelected || productSelected.length === 0) {
      return res.status(400).json({ success: false, message: "No products selected" });
    }

    const stockErrors = await validateStockAvailability(productSelected);

    if (stockErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock for some items",
        errors: stockErrors,
      });
    }

    res.status(200).json({
      success: true,
      message: "All items are in stock",
    });
  } catch (error) {
    console.error(chalk.red("Error validating stock:", error));
    res.status(500).json({ success: false, message: "Error validating stock" });
  }
});

// Endpoint to upload images to Cloudinary
app.post("/api/upload-images", upload.array("images", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No images uploaded" });
    }

    const uploadedUrls = [];

    for (const file of req.files) {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "ecom-products",
          resource_type: "auto",
        });
        uploadedUrls.push(result.secure_url);
        // Delete temporary file
        fs.unlinkSync(file.path);
      } catch (error) {
        console.error(chalk.red("Error uploading to Cloudinary:", error));
        // Clean up temporary file
        fs.unlinkSync(file.path);
        throw error;
      }
    }

    res.status(200).json({
      success: true,
      message: "Images uploaded successfully",
      urls: uploadedUrls,
    });
  } catch (error) {
    console.error(chalk.red("Error uploading images:", error));
    res.status(500).json({ success: false, message: "Error uploading images", error: error.message });
  }
});


// Endpoint to get all orders for a specific user
app.get("/orders/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }).populate('productSelected.productId', 'name imageSrc');
    if (!orders) {
      return res.status(404).json({ message: "No orders found for this user" });
    }
    res.status(200).json(orders);
  } catch (error) {
    console.error(chalk.red(error));
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// Endpoint to save comments for a product by ID
app.post("/products/:id/comments", async (req, res) => {
  const { id } = req.params;
  const { userId, name, comment, reviewImg, rating } = req.body;

  if (!comment) {
    return res.status(400).json({ message: "Comment text is required" });
  }

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const newComment = {
      userId,
      name: name || "Anonymous",
      comment,
      reviewImg: Array.isArray(reviewImg) ? reviewImg : [],
      rating: rating || 0,
      date: new Date(),
    };

    product.comments.push(newComment);
    await product.save();

    res.status(201).json({
      message: "Comment added successfully",
      comment: newComment,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding comment", error: error.message });
  }
});

// Endpoint to save order details
app.post("/orders/save", async (req, res) => {
  try {
    const {
      userId,
      productSelected,
      shippingAddress,
      payment,
      deliveryPrice = 0,
    } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!userId || !shippingAddress || !payment || !productSelected || productSelected.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Missing required order details" 
      });
    }

    // FIRST VALIDATION: ตรวจสอบสต็อกสินค้า
    const stockErrors = await validateStockAvailability(productSelected);
    if (stockErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock for one or more items",
        errors: stockErrors,
      });
    }

    // คำนวณราคา
    let calculatedTotalPrice = 0;
    const finalProductSelected = [];

    for (const item of productSelected) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ 
          success: false,
          message: `Product with ID ${item.productId} not found` 
        });
      }

      const priceAtPurchase = product.discount > 0
        ? product.price * (1 - product.discount / 100)
        : product.price;

      calculatedTotalPrice += priceAtPurchase * item.quantity;

      finalProductSelected.push({
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        price: priceAtPurchase,
      });
    }

    const finalTotal = calculatedTotalPrice + deliveryPrice;

    // สร้าง orderId และ trackingCode อัตโนมัติ
    const timestamp = Date.now();
    const orderId = `ORD-${timestamp}`;
    const trackingCode = `TRK${timestamp}`;

    // ตรวจสอบว่า orderId ซ้ำหรือไม่ (กรณี timestamp ชนกันในเวลาเดียวกัน)
    const existingOrder = await Order.findOne({ orderId });
    if (existingOrder) {
      return res.status(500).json({ 
        success: false,
        message: "Order ID collision. Please try again." 
      });
    }
    const stockVerifyErrors = await verifyStockBeforeDeduction(productSelected);
    if (stockVerifyErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Stock verification failed. Inventory may have changed.",
        errors: stockVerifyErrors,
      });
    }

    // สร้างออเดอร์
    const order = new Order({
      orderId,
      trackingCode,
      userId,
      productSelected: finalProductSelected,
      estDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      from: "Warehouse A",
      to: shippingAddress.country,
      deliveryPrice,
      totalPrice: finalTotal,
      payment,
      shippingAddress,
      lastLocation: "Warehouse A",
      carrier: "FedEx",
      status: "In Transit",
    });

    await order.save();
    try {
      const finalVerifyErrors = await verifyStockBeforeDeduction(productSelected);
      if (finalVerifyErrors.length > 0) {
        await Order.deleteOne({ orderId });
        return res.status(400).json({
          success: false,
          message: "Order failed: Stock no longer available. Please try again.",
          errors: finalVerifyErrors,
        });
      }

      await deductStock(finalProductSelected, orderId);
    } catch (stockError) {
      console.error(chalk.red("Error deducting stock:", stockError));
      // Delete the order if stock deduction fails
      await Order.deleteOne({ orderId });
      return res.status(500).json({
        success: false,
        message: "Error processing inventory. Order cancelled.",
        error: stockError.message,
      });
    }

    // ส่งผลลัพธ์กลับ
    res.status(201).json({
      success: true,
      message: "Order saved successfully and stock deducted",
      orderId: order.orderId,
      trackingCode: order.trackingCode,
    });

  } catch (error) {
    console.error(chalk.red("Error saving order details:", error));
    res.status(500).json({ 
      success: false,
      message: "Error saving order",
      error: error.message 
    });
  }
});

// Endpoint to upload CSV file and add products to MongoDB
app.post(
  "/api/upload-csv-products",
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;

    try {
      const products = [];

      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on("data", (row) => {
            if (!row.name || !row.price || !row.stock_remaining || !row.imageSrc) {
              console.warn(chalk.yellow("Skipping row due to missing required fields:", row));
              return;
            }
            try {
              const product = {
                name: row.name,
                price: parseFloat(row.price.replace("$", "")),
                stock_remaining: parseInt(row.stock_remaining),
                href: row.href || "",
                imageSrc: row.imageSrc,
                imageAlt: row.imageAlt || "",
                breadcrumbs: row.breadcrumbs || "",
                images: row.images ? row.images.split(" | ").map((image) => { const [src, alt] = image.split(" > "); if (!src || !alt) throw new Error("Invalid image format"); return { src, alt }; }) : [],
                colors: row.colors ? row.colors.split(" | ").map((color) => { const [name, classStr, selectedClass] = color.split(" > "); if (!name || !classStr || !selectedClass) throw new Error("Invalid color format"); return { name, class: classStr, selectedClass }; }) : [],
                sizes: row.sizes ? row.sizes.split(" | ").map((size) => { const [name, inStock] = size.split(" > "); if (!name || !inStock) throw new Error("Invalid size format"); return { name, inStock: inStock === "true" }; }) : [],
                description: row.description || "",
                highlights: row.highlights ? row.highlights.split(" | ") : [],
                details: row.details || "",
                discount: row.discount ? parseInt(row.discount) : 0,
                reviewsAvg: row.reviewsAverage || 0,
                reviewsCount: row.reviewsTotal || 0,
                reviewsHref: row.reviewLink || "#",
              };
              if (isNaN(product.price) || isNaN(product.stock_remaining) || isNaN(product.discount)) {
                throw new Error("Invalid numeric value");
              }
              products.push(product);
            } catch (error) {
              console.warn(chalk.yellow(`Skipping row due to parsing error: ${error.message}`), row);
            }
          })
          .on("end", () => resolve())
          .on("error", (error) => reject(error));
      });

      if (products.length === 0) {
        return res.status(400).json({ message: "No valid products found in CSV" });
      }

      await Product.insertMany(products, { ordered: false });
      res.status(200).json({ message: `${products.length} products added successfully!` });
    } catch (error) {
      console.error(chalk.red("Error processing CSV:", error));
      res.status(500).json({ message: "Error uploading products", error: error.message });
    } finally {
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.error(chalk.red("Error deleting file:", cleanupError));
      }
    }
  }
);

// Endpoint to add Discount to product by ID
app.put("/api/products/:id/discount", async (req, res) => {
  const { id } = req.params;
  const { discount } = req.body;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    product.discount = discount;
    await product.save();
    res.status(200).json({ message: "Discount added successfully" });
  } catch (error) {
    console.error(chalk.red(error));
    res.status(500).json({ message: "Error adding discount" });
  }
});

// Endpoint to create a single product
app.post("/api/products", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ success: true, message: "Product created successfully", product });
  } catch (error) {
    console.error(chalk.red("Error creating product:", error));
    res.status(400).json({ success: false, message: "Failed to create product", error: error.message });
  }
});

// Endpoint to update a product by ID
app.put("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    console.error(chalk.red("Error updating product:", error));
    res.status(400).json({ success: false, message: "Failed to update product", error: error.message });
  }
});

//Endpoint to get all products
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error(chalk.red(error));
    res.status(500).json({ message: "Error fetching products" });
  }
});

// Endpoint to get a single product by ID
app.get("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    res.json(product);
  } catch (error) {
    console.error(chalk.red(error));
    res.status(500).send("Server error");
  }
});

app.post("/api/products/stock", async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!productIds || productIds.length === 0) {
      return res.status(400).json({ success: false, message: "No product IDs provided" });
    }

    const products = await Product.find({
      '_id': { $in: productIds }
    });

    const stockLevels = products.reduce((acc, product) => {
      acc[product._id.toString()] = product.stock_remaining;
      return acc;
    }, {});

    res.status(200).json({ success: true, stockLevels });

  } catch (error) {
    console.error(chalk.red("Error fetching stock levels:", error));
    res.status(500).json({ success: false, message: "Error fetching stock levels" });
  }
});

// Endpoint to get user data and send it to Frontend
app.get("/user", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedToken.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      userId: user._id,
      email: user.email,
      fname: user.fname,
      lname: user.lname,
      address: user.address,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch user details" });
  }
});

// Endpoint to fetch admin data and send it to Frontend
app.get("/admin", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (decodedToken.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const admin = await Admin.findById(decodedToken.id).select("-password");
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    res.status(200).json({
      success: true,
      id: admin._id,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      employeeID: admin.employeeID,
      phoneNumber: admin.phoneNumber,
      role: admin.role,
    });
  } catch (error) {
    console.error(chalk.red(error));
    res.status(500).json({ success: false, message: "Failed to fetch admin details" });
  }
});

// Endpoint to fetch selected products for a user
app.get("/cart/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate('selectedProducts.productId');
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, selectedProducts: user.selectedProducts });
  } catch (error) {
    console.error(chalk.red(error));
    res.status(500).json({ success: false, message: "Failed to fetch selected products" });
  }
});

// Endpoint to edit Admin orders by ID
app.put("/admin/orders/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const updatedOrderData = req.body;

    const order = await Order.findOneAndUpdate({ orderId }, updatedOrderData, {
      new: true,
      runValidators: true,
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, message: "Order updated successfully", order });
  } catch (error) {
    console.error(chalk.red("Error updating order:", error));
    res.status(500).json({ success: false, message: `Failed to update order: ${error.message}` });
  }
});

// Endpoint to update the quantity of a product in the cart
app.put("/cart/update-quantity/:userId/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { quantity } = req.body;

    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ success: false, message: "Invalid quantity" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const productIndex = user.selectedProducts.findIndex(
      (p) => p.productId.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({ success: false, message: "Product not found in cart" });
    }

    user.selectedProducts[productIndex].quantity = quantity;
    await user.save();

    const populatedUser = await User.findById(userId).populate('selectedProducts.productId');

    res.status(200).json({
      success: true,
      message: "Product quantity updated successfully",
      selectedProducts: populatedUser.selectedProducts,
    });
  } catch (error) {
    console.error(chalk.red(error));
    res.status(500).json({ success: false, message: "Failed to update product quantity" });
  }
});


// Endpoint to change password
app.put("/change-password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decodedToken.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }

    user.password = newPassword; // Hashing is handled by pre-save hook
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error(chalk.red(error));
    res.status(500).json({ success: false, message: "Failed to update password" });
  }
});

// Endpoint to Remove Discount from product by ID
app.put("/api/products/:id/remove-discount", async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    product.discount = 0;
    await product.save();
    res.status(200).json({ message: "Discount removed successfully", product: product });
  } catch (error) {
    console.error(chalk.red("Error removing discount:", error));
    res.status(500).json({ message: "Server error while removing discount", error: error.message });
  }
});

// Endpoint to update address by ID
app.put("/update-address/:userId/:addressId", async (req, res) => {
  try {
    const { userId, addressId } = req.params;
    const updatedAddress = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const addressIndex = user.address.findIndex((addr) => addr._id.toString() === addressId);
    if (addressIndex === -1) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    user.address[addressIndex] = { ...user.address[addressIndex]._doc, ...updatedAddress };
    await user.save();

    res.status(200).json({ success: true, message: "Address updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update address" });
  }
});

// Endpoint to save selected products to cart
app.post("/save-selected-products", async (req, res) => {
  try {
    const { userId, productId, selectedColor, selectedSize, quantity = 1 } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    const product = await Product.findById(productId);
    if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
    }

    const existingProductIndex = user.selectedProducts.findIndex(
      (p) =>
        p.productId.toString() === productId &&
        p.selectedColor === selectedColor &&
        p.selectedSize === selectedSize
    );

    if (existingProductIndex > -1) {
      user.selectedProducts[existingProductIndex].quantity += quantity;
    } else {
      user.selectedProducts.push({
        productId,
        selectedColor,
        selectedSize,
        quantity,
      });
    }

    await user.save();
    const populatedUser = await User.findById(userId).populate('selectedProducts.productId');

    res.status(201).json({ 
        success: true, 
        message: "Selected product saved successfully",
        selectedProducts: populatedUser.selectedProducts
    });
  } catch (error) {
    console.error(chalk.red(error));
    res.status(500).json({ success: false, message: "Failed to save selected product" });
  }
});

// Endpoint to save user address
app.post("/save-address", async (req, res) => {
  try {
    const { userId, ...addressDetails } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.address.push(addressDetails);
    await user.save();

    res.status(201).json({ success: true, message: "Address saved successfully", address: user.address });
  } catch (error) {
    console.error(chalk.red(error));
    res.status(500).json({ success: false, message: "Failed to save address" });
  }
});

// Registration endpoint
app.post("/register", async (req, res) => {
  try {
    const { email, password, fname, lname } = req.body;
    if (!email || !password || !fname || !lname) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already in use" });
    }

    const user = new User({ email: email.toLowerCase(), password, fname, lname });
    await user.save();

    res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error(chalk.red(error));
    res.status(500).json({ success: false, message: "Registration failed" });
  }
});

// Login endpoint
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (!existingUser) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const userPayload = { id: existingUser._id, email: existingUser.email };
    const token = jwt.sign(userPayload, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
          id: existingUser._id,
          fname: existingUser.fname,
          lname: existingUser.lname,
          email: existingUser.email,
      }
    });
  } catch (error) {
    console.error(chalk.red(error));
    res.status(500).json({ success: false, message: "Login failed" });
  }
});

// Admin registration
app.post("/admin-register", async (req, res) => {
  try {
    const { email, password, firstName, lastName, employeeID, phoneNumber } = req.body;

    if (!email || !password || !firstName || !lastName || !employeeID || !phoneNumber) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return res.status(409).json({ success: false, message: "Email already in use" });
    }

    const admin = new Admin({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      employeeID,
      phoneNumber,
    });
    await admin.save();

    res.status(201).json({ success: true, message: "Admin registered successfully" });
  } catch (error) {
    console.error(chalk.red(error));
    res.status(500).json({ success: false, message: "Registration failed" });
  }
});

// Admin Login endpoint
app.post("/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (!existingAdmin) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, existingAdmin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const adminPayload = { id: existingAdmin._id, email: existingAdmin.email, role: "admin" };
    const token = jwt.sign(adminPayload, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      admin: {
          id: existingAdmin._id,
          email: existingAdmin.email,
          firstName: existingAdmin.firstName,
          lastName: existingAdmin.lastName,
      }
    });
  } catch (error) {
    console.error(chalk.red(error));
    res.status(500).json({ success: false, message: "Login failed" });
  }
});

// Logout endpoints
app.post("/admin-logout", (req, res) => res.status(200).json({ success: true, message: "Logged out successfully" }));
app.post("/logout", (req, res) => res.status(200).json({ success: true, message: "Logged out successfully" }));

// Endpoint to delete an order by ID
app.delete("/admin/orders/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOneAndDelete({ orderId });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Restore stock when order is cancelled
    try {
      await refundStock(order.productSelected, orderId, "Order deleted/cancelled");
    } catch (stockError) {
      console.error(chalk.red("Error refunding stock during order deletion:", stockError));
      // Still delete the order but log the error
    }

    res.status(200).json({ success: true, message: "Order deleted successfully and stock restored" });
  } catch (error) {
    console.error(chalk.red("Error deleting order:", error));
    res.status(500).json({ success: false, message: "Failed to delete order" });
  }
});

// Endpoint to cancel order and restore stock
app.post("/orders/:orderId/cancel", async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Only allow cancellation of orders that are not yet shipped
    if (order.status === "Delivered" || order.status === "Shipped") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.status}`,
      });
    }

    // Restore stock
    try {
      await refundStock(order.productSelected, orderId, "Order cancelled by customer");
    } catch (stockError) {
      console.error(chalk.red("Error refunding stock during order cancellation:", stockError));
      return res.status(500).json({
        success: false,
        message: "Error processing stock refund",
      });
    }

    // Update order status
    order.status = "Cancelled";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully and stock restored",
    });
  } catch (error) {
    console.error(chalk.red("Error cancelling order:", error));
    res.status(500).json({ success: false, message: "Failed to cancel order" });
  }
});

// intto get stock history for a product
app.get("/api/products/:id/stock-history", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).select("name stock_remaining stock_reserved stock_history");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      productId: product._id,
      productName: product.name,
      currentStock: product.stock_remaining,
      reservedStock: product.stock_reserved,
      availableStock: product.stock_remaining - product.stock_reserved,
      history: product.stock_history.sort((a, b) => b.timestamp - a.timestamp),
    });
  } catch (error) {
    console.error(chalk.red("Error fetching stock history:", error));
    res.status(500).json({ message: "Error fetching stock history" });
  }
});

// Endpoint to Delete address by ID
app.delete("/delete-address/:userId/:addressId", async (req, res) => {
  try {
    const { userId, addressId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    user.address.pull({ _id: addressId });
    await user.save();
    res.status(200).json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    console.error(chalk.red(error));
    res.status(500).json({ success: false, message: "Failed to delete address" });
  }
});

//Endpoint to Delete product from Cart
app.delete("/cart/delete-product/:userId/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    user.selectedProducts.pull({ productId: productId });
    await user.save();
    
    const populatedUser = await User.findById(userId).populate('selectedProducts.productId');

    res.status(200).json({
      success: true,
      message: "Product deleted from cart successfully",
      selectedProducts: populatedUser.selectedProducts,
    });
  } catch (error) {
    console.error(chalk.red(error));
    res.status(500).json({ success: false, message: "Failed to delete product from cart" });
  }
});

// Endpoint to delete all products in cart by userId
app.delete("/cart/clear/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    user.selectedProducts = [];
    await user.save();
    res.status(200).json({ success: true, message: "All products cleared from cart successfully" });
  } catch (error) {
    console.error(chalk.red(error));
    res.status(500).json({ success: false, message: "Failed to clear cart products" });
  }
});

// Endpoint to delete Account by userID
app.delete("/deleteAccount/:userId", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    // Optionally, delete related data like orders
    // await Order.deleteMany({ userId: req.params.userId });
    res.status(200).json({ success: true, message: "User account deleted successfully" });
  } catch (error) {
    console.error(chalk.red(error));
    res.status(500).json({ success: false, message: "Failed to delete user account" });
  }
});

// Endpoint to delete a comment
app.delete("/api/products/:id/comments/:commentId", async (req, res) => {
  const { id, commentId } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    product.comments.pull({ _id: commentId });
    await product.save();
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error(chalk.red("Error deleting comment:", error));
    res.status(500).json({ message: "Error deleting comment", error: error.message });
  }
});

// Endpoint to get all users (for admin)
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude passwords from the result
    res.status(200).json(users);
  } catch (error) {
    console.error(chalk.red("Error fetching users:", error));
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Endpoint to get all admins (for admin)
app.get("/api/admins", async (req, res) => {
  try {
    const admins = await Admin.find({}, '-password'); // Exclude passwords
    res.status(200).json(admins);
  } catch (error) {
    console.error(chalk.red("Error fetching admins:", error));
    res.status(500).json({ message: "Error fetching admins" });
  }
});

// Endpoint to delete a product by ID
app.delete("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Collect possible image URLs from the product document
    const urls = [];
    if (product.imageSrc) urls.push(product.imageSrc);
    if (Array.isArray(product.images)) {
      product.images.forEach((img) => {
        if (img && img.src) urls.push(img.src);
      });
    }

    // extract Cloudinary public_id from a Cloudinary URL
    const extractPublicId = (url) => {
      if (!url || typeof url !== 'string') return null;
      // Match the part after /upload/ optionally skipping /v1234/ and capturing until file extension or query
      const m = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)(?:$|\?)/);
      return m && m[1] ? m[1] : null;
    };

    // Attempt to delete each image from Cloudinary; continue on error
    for (const url of urls) {
      const publicId = extractPublicId(url);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
          console.log(chalk.green(`Deleted Cloudinary image: ${publicId}`));
        } catch (err) {
          console.error(chalk.yellow(`Failed to delete Cloudinary image ${publicId}:`, err.message || err));
        }
      } else {
        console.log(chalk.yellow(`Could not extract public_id from URL, skipping Cloudinary delete: ${url}`));
      }
    }

    // Now remove the product document from DB
    await Product.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Product and associated images (if any) deleted successfully" });
  } catch (error) {
    console.error(chalk.red("Error deleting product:", error));
    res.status(500).json({ success: false, message: "Failed to delete product", error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(chalk.blue(`Server is running on port ${PORT}`));
});
