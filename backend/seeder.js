import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/krisho');

const importData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    const createdUsers = await User.create([
      { name: 'Admin User', email: 'admin@example.com', password: 'password', role: 'consumer', city: 'Delhi', state: 'Delhi' },
      { name: 'Farmer Ram', email: 'farmer@example.com', password: 'password', role: 'supplier', city: 'Amritsar', state: 'Punjab' },
      { name: 'Consumer Amit', email: 'consumer@example.com', password: 'password', role: 'consumer', city: 'Mumbai', state: 'Maharashtra' },
    ]);

    const supplierId = createdUsers[1]._id;

    const sampleProducts = [
      {
        name: 'Organic Basmati Rice',
        images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        description: 'Long-grain fragrant rice grown without pesticides.',
        category: 'Grains',
        price: 120,
        stock: 500,
        unit: 'kg',
        supplier: supplierId,
        hashtags: ['organic', 'basmati', 'punjab'],
        rating: 4.8,
        numReviews: 24,
      },
      {
        name: 'Fresh Tomatoes',
        images: ['https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        description: 'Juicy red tomatoes harvested daily.',
        category: 'Vegetables',
        price: 40,
        stock: 100,
        unit: 'kg',
        supplier: supplierId,
        hashtags: ['fresh', 'vegetables'],
        rating: 4.5,
        numReviews: 15,
      },
      {
        name: 'Alphonso Mangoes',
        images: ['https://images.unsplash.com/photo-1553279768-865429fa0078?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        description: 'Sweet and aromatic King of Mangoes.',
        category: 'Fruits',
        price: 600,
        stock: 50,
        unit: 'dozen',
        supplier: supplierId,
        hashtags: ['mango', 'alphonso', 'seasonal'],
        rating: 4.9,
        numReviews: 40,
      },
      {
        name: 'Pure Desi Ghee',
        images: ['https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        description: 'Hand-churned traditional A2 cow ghee.',
        category: 'Dairy',
        price: 850,
        stock: 20,
        unit: 'litre',
        supplier: supplierId,
        hashtags: ['dairy', 'ghee', 'traditional'],
        rating: 5.0,
        numReviews: 12,
      },
    ];

    await Product.insertMany(sampleProducts);

    console.log('✅ Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
