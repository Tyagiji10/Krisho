import { db } from './backend/config/firebaseAdmin.js';

async function check() {
  const snapshot = await db.collection('orders').get();
  console.log(`Total orders found: ${snapshot.size}`);
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`Order ID: ${doc.id}`);
    data.orderItems.forEach(item => {
      console.log(`  Item: ${item.name}, Supplier: ${item.supplier}`);
    });
  });
  process.exit(0);
}

check();
