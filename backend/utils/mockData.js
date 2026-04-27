// In-memory storage for users and products when DB is down
export const mockUsers = [
  {
    _id: 's1',
    name: 'Ram Singh',
    email: 'ram@krisho.com',
    password: 'password123',
    role: 'supplier',
    city: 'Amritsar',
    state: 'Punjab',
    totalEarnings: 15400,
    paymentDetails: { upiId: 'ram@okaxis' }
  },
  {
    _id: 's2',
    name: 'Kisan Kumar',
    email: 'kisan@krisho.com',
    password: 'password123',
    role: 'supplier',
    city: 'Karnal',
    state: 'Haryana',
    totalEarnings: 8200
  }
];

export const mockProducts = [];

export const mockOrders = [];

export const isDbConnected = (mongoose) => {
  return mongoose.connection.readyState === 1;
};

// Helper to generate a unique ID for mock items
export const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

