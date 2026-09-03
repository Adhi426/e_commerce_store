const Product = require('../models/Product');
const { getDBStatus } = require('../config/db');

// Initial seed store for memory fallback if MongoDB daemon isn't running
let memoryProducts = [];

const setMemoryProducts = (products) => {
  memoryProducts = [...products];
};

const getMemoryProducts = () => memoryProducts;

// @route   GET /api/products
const getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, rating, sort, page = 1, limit = 12, featured } = req.query;
    const isDB = getDBStatus();

    if (isDB) {
      const query = {};

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
        ];
      }

      if (category && category !== 'All') {
        query.category = category;
      }

      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }

      if (rating) {
        query.rating = { $gte: Number(rating) };
      }

      if (featured === 'true') {
        query.featured = true;
      }

      let sortOption = {};
      if (sort === 'price_asc') sortOption = { price: 1 };
      else if (sort === 'price_desc') sortOption = { price: -1 };
      else if (sort === 'rating') sortOption = { rating: -1 };
      else if (sort === 'newest') sortOption = { createdAt: -1 };
      else sortOption = { featured: -1, createdAt: -1 };

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const total = await Product.countDocuments(query);
      const products = await Product.find(query).sort(sortOption).skip(skip).limit(limitNum);

      return res.json({
        success: true,
        count: products.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        products,
      });
    } else {
      // Memory Store Filter & Sorting Logic
      let filtered = [...memoryProducts];

      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (p) => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s) || p.category.toLowerCase().includes(s)
        );
      }

      if (category && category !== 'All') {
        filtered = filtered.filter((p) => p.category === category);
      }

      if (minPrice) filtered = filtered.filter((p) => p.price >= Number(minPrice));
      if (maxPrice) filtered = filtered.filter((p) => p.price <= Number(maxPrice));
      if (rating) filtered = filtered.filter((p) => p.rating >= Number(rating));
      if (featured === 'true') filtered = filtered.filter((p) => p.featured === true);

      if (sort === 'price_asc') filtered.sort((a, b) => a.price - b.price);
      else if (sort === 'price_desc') filtered.sort((a, b) => b.price - a.price);
      else if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);
      else if (sort === 'newest') filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const start = (pageNum - 1) * limitNum;
      const paginated = filtered.slice(start, start + limitNum);

      return res.json({
        success: true,
        count: paginated.length,
        total: filtered.length,
        page: pageNum,
        pages: Math.ceil(filtered.length / limitNum) || 1,
        products: paginated,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const isDB = getDBStatus();

    if (isDB) {
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      return res.json({ success: true, product });
    } else {
      const product = memoryProducts.find((p) => p._id.toString() === id || p.id === id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      return res.json({ success: true, product });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/products (Admin)
const createProduct = async (req, res) => {
  try {
    const { name, description, category, price, originalPrice, images, stock, featured, specifications } = req.body;
    const isDB = getDBStatus();

    const origPrice = originalPrice || price * 1.2;
    const discount = Math.round(((origPrice - price) / origPrice) * 100);

    const newProductData = {
      name,
      description,
      category,
      price: Number(price),
      originalPrice: Number(origPrice),
      discount: Math.max(0, discount),
      images: Array.isArray(images) && images.length ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'],
      stock: Number(stock) || 15,
      rating: 4.8,
      reviewsCount: 1,
      featured: Boolean(featured),
      specifications: specifications || {},
      createdAt: new Date(),
    };

    if (isDB) {
      const product = await Product.create(newProductData);
      return res.status(201).json({ success: true, message: 'Product created successfully', product });
    } else {
      const product = { _id: `mem_prod_${Date.now()}`, ...newProductData };
      memoryProducts.unshift(product);
      return res.status(201).json({ success: true, message: 'Product created successfully (Local Store)', product });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/products/:id (Admin)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const isDB = getDBStatus();

    if (isDB) {
      const product = await Product.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      return res.json({ success: true, message: 'Product updated successfully', product });
    } else {
      const idx = memoryProducts.findIndex((p) => p._id.toString() === id || p.id === id);
      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      memoryProducts[idx] = { ...memoryProducts[idx], ...req.body, updatedAt: new Date() };
      return res.json({ success: true, message: 'Product updated successfully', product: memoryProducts[idx] });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/products/:id (Admin)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const isDB = getDBStatus();

    if (isDB) {
      const product = await Product.findByIdAndDelete(id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      return res.json({ success: true, message: 'Product deleted successfully' });
    } else {
      const idx = memoryProducts.findIndex((p) => p._id.toString() === id || p.id === id);
      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      memoryProducts.splice(idx, 1);
      return res.json({ success: true, message: 'Product deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  setMemoryProducts,
  getMemoryProducts,
};
