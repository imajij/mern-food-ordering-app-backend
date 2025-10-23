const mongoose = require('mongoose');

const FoodItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide food name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide description'],
  },
  price: {
    type: Number,
    required: [true, 'Please provide price'],
    min: 0,
  },
  category: {
    type: String,
    required: [true, 'Please provide category'],
    enum: ['appetizer', 'main', 'dessert', 'beverage', 'other'],
  },
  image: {
    type: String,
    default: 'default-food.jpg',
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('FoodItem', FoodItemSchema);
