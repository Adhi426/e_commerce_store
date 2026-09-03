const Order = require('../models/Order');
const Product = require('../models/Product');
const { getDBStatus } = require('../config/db');
const { getMemoryProducts } = require('./productController');

let memoryOrders = [];

// Helper to generate unique order ID (e.g. NX-2026-8F42K)
const generateOrderID = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 5; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `NX-2026-${rand}`;
};

// @route   POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    const userId = req.user.id;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Cart items are required to place an order' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city) {
      return res.status(400).json({ success: false, message: 'Please provide full shipping address' });
    }

    const isDB = getDBStatus();
    let subtotal = 0;
    const processedItems = [];

    // Calculate totals & check/reduce stock
    for (const item of items) {
      let productObj;
      if (isDB) {
        productObj = await Product.findById(item.product);
      } else {
        const mems = getMemoryProducts();
        productObj = mems.find((p) => p._id.toString() === item.product || p.id === item.product);
      }

      if (!productObj) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.name || item.product}` });
      }

      if (productObj.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${productObj.name}. Only ${productObj.stock} remaining.`,
        });
      }

      const itemTotal = productObj.price * item.quantity;
      subtotal += itemTotal;

      processedItems.push({
        product: productObj._id,
        name: productObj.name,
        price: productObj.price,
        quantity: item.quantity,
        image: productObj.images[0] || '',
      });

      // Reduce Stock
      if (isDB) {
        productObj.stock -= item.quantity;
        await productObj.save();
      } else {
        productObj.stock -= item.quantity;
      }
    }

    const discount = subtotal > 1500 ? 150 : 0;
    const shipping = subtotal > 1000 ? 0 : 99;
    const tax = Math.round(subtotal * 0.05); // 5% GST tax
    const total = Math.max(0, subtotal - discount + shipping + tax);

    const orderId = generateOrderID();

    const orderData = {
      orderId,
      user: userId,
      items: processedItems,
      shippingAddress,
      subtotal,
      discount,
      shipping,
      tax,
      total,
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Completed',
      orderStatus: 'Confirmed',
      createdAt: new Date(),
    };

    if (isDB) {
      const order = await Order.create(orderData);
      return res.status(201).json({
        success: true,
        message: 'Order placed successfully!',
        order,
      });
    } else {
      const order = { _id: `mem_order_${Date.now()}`, ...orderData };
      memoryOrders.unshift(order);
      return res.status(201).json({
        success: true,
        message: 'Order placed successfully! (Local Store)',
        order,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/orders
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const isDB = getDBStatus();

    if (isDB) {
      let orders;
      if (role === 'admin') {
        orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
      } else {
        orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
      }
      return res.json({ success: true, count: orders.length, orders });
    } else {
      let orders;
      if (role === 'admin') {
        orders = [...memoryOrders];
      } else {
        orders = memoryOrders.filter((o) => o.user.toString() === userId || o.user === userId);
      }
      return res.json({ success: true, count: orders.length, orders });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const isDB = getDBStatus();

    if (isDB) {
      const order = await Order.findById(id).populate('user', 'name email');
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      return res.json({ success: true, order });
    } else {
      const order = memoryOrders.find((o) => o._id.toString() === id || o.orderId === id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      return res.json({ success: true, order });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/orders/:id/status (Admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;
    const isDB = getDBStatus();

    if (isDB) {
      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      if (orderStatus) order.orderStatus = orderStatus;
      if (paymentStatus) order.paymentStatus = paymentStatus;

      await order.save();
      return res.json({ success: true, message: 'Order status updated', order });
    } else {
      const order = memoryOrders.find((o) => o._id.toString() === id || o.orderId === id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      if (orderStatus) order.orderStatus = orderStatus;
      if (paymentStatus) order.paymentStatus = paymentStatus;

      return res.json({ success: true, message: 'Order status updated', order });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createOrder, getUserOrders, getOrderById, updateOrderStatus, memoryOrders };
