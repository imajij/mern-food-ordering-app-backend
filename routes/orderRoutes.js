const express = require('express');
const Order = require('../models/Order');
const FoodItem = require('../models/FoodItem');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { items, deliveryAddress } = req.body;

    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items provided' });
    }

    if (!deliveryAddress) {
      return res.status(400).json({ message: 'Please provide delivery address' });
    }

    // Validate and calculate total
    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const food = await FoodItem.findById(item.food);
      
      if (!food) {
        return res.status(404).json({ message: `Food item ${item.food} not found` });
      }

      if (!food.isAvailable) {
        return res.status(400).json({ message: `${food.name} is not available` });
      }

      const itemTotal = food.price * item.quantity;
      totalPrice += itemTotal;

      orderItems.push({
        food: food._id,
        quantity: item.quantity,
        price: food.price,
      });
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalPrice,
      deliveryAddress,
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items.food', 'name price');

    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/orders
// @desc    Get logged in user orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.food', 'name price image')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.food', 'name price image');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/orders/all/admin
// @desc    Get all orders (admin)
// @access  Private/Admin
router.get('/all/admin', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .populate('items.food', 'name price')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Please provide status' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items.food', 'name price');

    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/orders/:id
// @desc    Update order (status, etc.)
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { status, deliveryAddress } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update fields if provided
    if (status) order.status = status;
    if (deliveryAddress) order.deliveryAddress = deliveryAddress;

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items.food', 'name price');

    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
