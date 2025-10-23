const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const FoodItem = require('../models/FoodItem');
const Order = require('../models/Order');
const connectDB = require('../config/db');

dotenv.config();

const users = [
  {
    name: 'Admin User',
    email: 'admin@foodapp.com',
    password: 'admin123',
    isAdmin: true,
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    isAdmin: false,
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    isAdmin: false,
  },
];

const foodItems = [
  {
    name: 'Classic Burger',
    description: 'Juicy beef patty with lettuce, tomato, and special sauce',
    price: 8.99,
    category: 'main',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
    isAvailable: true,
  },
  {
    name: 'Margherita Pizza',
    description: 'Fresh mozzarella, tomatoes, and basil on crispy crust',
    price: 12.99,
    category: 'main',
    image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=500',
    isAvailable: true,
  },
  {
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce with parmesan and croutons',
    price: 6.99,
    category: 'appetizer',
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500',
    isAvailable: true,
  },
  {
    name: 'Chicken Wings',
    description: 'Spicy buffalo wings with blue cheese dip',
    price: 9.99,
    category: 'appetizer',
    image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=500',
    isAvailable: true,
  },
  {
    name: 'Spaghetti Carbonara',
    description: 'Creamy pasta with bacon and parmesan cheese',
    price: 11.99,
    category: 'main',
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500',
    isAvailable: true,
  },
  {
    name: 'Grilled Salmon',
    description: 'Fresh Atlantic salmon with vegetables and lemon butter',
    price: 16.99,
    category: 'main',
    image: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=500',
    isAvailable: true,
  },
  {
    name: 'Chocolate Cake',
    description: 'Rich chocolate cake with vanilla ice cream',
    price: 5.99,
    category: 'dessert',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500',
    isAvailable: true,
  },
  {
    name: 'Tiramisu',
    description: 'Classic Italian dessert with coffee and mascarpone',
    price: 6.99,
    category: 'dessert',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500',
    isAvailable: true,
  },
  {
    name: 'Coca Cola',
    description: 'Classic refreshing cola drink',
    price: 2.99,
    category: 'beverage',
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=500',
    isAvailable: true,
  },
  {
    name: 'Fresh Orange Juice',
    description: 'Freshly squeezed orange juice',
    price: 3.99,
    category: 'beverage',
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500',
    isAvailable: true,
  },
  {
    name: 'Tacos',
    description: 'Three soft tacos with beef, cheese, and salsa',
    price: 9.99,
    category: 'main',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500',
    isAvailable: true,
  },
  {
    name: 'Onion Rings',
    description: 'Crispy golden onion rings with ranch dip',
    price: 4.99,
    category: 'appetizer',
    image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=500',
    isAvailable: true,
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany();
    await FoodItem.deleteMany();
    await Order.deleteMany();

    // Create users
    console.log('Creating users...');
    const createdUsers = await User.create(users);
    console.log(`✅ ${createdUsers.length} users created`);

    // Create food items
    console.log('Creating food items...');
    const createdFoods = await FoodItem.create(foodItems);
    console.log(`✅ ${createdFoods.length} food items created`);

    // Create sample orders
    console.log('Creating sample orders...');
    const sampleOrders = [
      {
        user: createdUsers[1]._id, // John's order
        items: [
          {
            food: createdFoods[0]._id, // Classic Burger
            quantity: 2,
            price: createdFoods[0].price,
          },
          {
            food: createdFoods[8]._id, // Coca Cola
            quantity: 2,
            price: createdFoods[8].price,
          },
        ],
        totalPrice: (createdFoods[0].price * 2) + (createdFoods[8].price * 2),
        deliveryAddress: '123 Main St, New York, NY 10001',
        status: 'delivered',
      },
      {
        user: createdUsers[2]._id, // Jane's order
        items: [
          {
            food: createdFoods[1]._id, // Margherita Pizza
            quantity: 1,
            price: createdFoods[1].price,
          },
          {
            food: createdFoods[6]._id, // Chocolate Cake
            quantity: 1,
            price: createdFoods[6].price,
          },
        ],
        totalPrice: createdFoods[1].price + createdFoods[6].price,
        deliveryAddress: '456 Oak Ave, Brooklyn, NY 11201',
        status: 'confirmed',
      },
      {
        user: createdUsers[1]._id, // John's second order
        items: [
          {
            food: createdFoods[5]._id, // Grilled Salmon
            quantity: 1,
            price: createdFoods[5].price,
          },
          {
            food: createdFoods[2]._id, // Caesar Salad
            quantity: 1,
            price: createdFoods[2].price,
          },
        ],
        totalPrice: createdFoods[5].price + createdFoods[2].price,
        deliveryAddress: '123 Main St, New York, NY 10001',
        status: 'pending',
      },
    ];

    const createdOrders = await Order.create(sampleOrders);
    console.log(`✅ ${createdOrders.length} orders created`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Admin: admin@foodapp.com / admin123');
    console.log('User1: john@example.com / password123');
    console.log('User2: jane@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
