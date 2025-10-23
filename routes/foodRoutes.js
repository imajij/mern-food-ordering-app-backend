const express = require('express');
const FoodItem = require('../models/FoodItem');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/foods
// @desc    Get all food items
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const foods = await FoodItem.find(query).sort({ createdAt: -1 });
    res.json(foods);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/foods/:id
// @desc    Get single food item
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const food = await FoodItem.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    res.json(food);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Food item not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/foods
// @desc    Create food item
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, description, price, category, image } = req.body;

    // Validation
    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const food = await FoodItem.create({
      name,
      description,
      price,
      category,
      image,
    });

    res.status(201).json(food);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/foods/:id
// @desc    Update food item
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { name, description, price, category, image, isAvailable } = req.body;

    let food = await FoodItem.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    food = await FoodItem.findByIdAndUpdate(
      req.params.id,
      { name, description, price, category, image, isAvailable },
      { new: true, runValidators: true }
    );

    res.json(food);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Food item not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/foods/:id
// @desc    Delete food item
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const food = await FoodItem.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    await food.deleteOne();
    res.json({ message: 'Food item removed' });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Food item not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
