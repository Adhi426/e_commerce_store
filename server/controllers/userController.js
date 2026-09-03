const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { getDBStatus } = require('../config/db');
const { memoryUsers } = require('./authController');
const { memoryOrders } = require('./orderController');
const { getMemoryProducts } = require('./productController');

// @route   GET /api/users/profile
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const isDB = getDBStatus();

    if (isDB) {
      const user = await User.findById(userId).select('-password');
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      return res.json({ success: true, user });
    } else {
      const user = memoryUsers.find((u) => u._id === userId || u.email === req.user.email);
      if (!user) return res.json({ success: true, user: req.user });
      const { passwordHash, ...userInfo } = user;
      return res.json({ success: true, user: userInfo });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/users/profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, address } = req.body;
    const isDB = getDBStatus();

    if (isDB) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (address) user.address = { ...user.address, ...address };

      await user.save();
      return res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          role: user.role,
        },
      });
    } else {
      const user = memoryUsers.find((u) => u._id === userId || u.email === req.user.email);
      if (user) {
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (address) user.address = { ...user.address, ...address };
      }
      return res.json({
        success: true,
        message: 'Profile updated successfully',
        user: user || req.user,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/stats/dashboard (Admin)
const getAdminStats = async (req, res) => {
  try {
    const isDB = getDBStatus();

    if (isDB) {
      const totalUsers = await User.countDocuments();
      const totalProducts = await Product.countDocuments();
      const totalOrders = await Order.countDocuments();
      const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });

      const allOrders = await Order.find({ orderStatus: { $ne: 'Cancelled' } });
      const totalRevenue = allOrders.reduce((sum, ord) => sum + ord.total, 0);

      const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email');

      return res.json({
        success: true,
        stats: {
          totalRevenue,
          totalOrders,
          totalProducts,
          totalUsers,
          pendingOrders,
        },
        recentOrders,
      });
    } else {
      const memOrders = memoryOrders;
      const memProds = getMemoryProducts();

      const totalUsers = memoryUsers.length;
      const totalProducts = memProds.length;
      const totalOrders = memOrders.length;
      const pendingOrders = memOrders.filter((o) => o.orderStatus === 'Pending').length;

      const totalRevenue = memOrders
        .filter((o) => o.orderStatus !== 'Cancelled')
        .reduce((sum, ord) => sum + ord.total, 0);

      return res.json({
        success: true,
        stats: {
          totalRevenue,
          totalOrders,
          totalProducts,
          totalUsers,
          pendingOrders,
        },
        recentOrders: memOrders.slice(0, 5),
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getUserProfile, updateUserProfile, getAdminStats };
