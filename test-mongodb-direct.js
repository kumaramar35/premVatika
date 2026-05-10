import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

// Try with standard connection string (non-SRV)
// MongoDB Atlas typically uses these ports and hosts
const standardUri = 'mongodb://premvatika:PremVatika%401234@cluster0-shard-00-00.hepaixd.mongodb.net:27017,cluster0-shard-00-01.hepaixd.mongodb.net:27017,cluster0-shard-00-02.hepaixd.mongodb.net:27017/premvatika?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

console.log('=== Testing MongoDB Atlas Direct Connection (non-SRV) ===');
console.log('Using standard connection string (non-SRV)');

async function testConnection() {
  const client = new MongoClient(standardUri, {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 15000,
  });
  
  try {
    console.log('\nAttempting to connect...');
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas successfully!');
    
    // Test a simple operation
    const db = client.db('premvatika');
    const collections = await db.listCollections().toArray();
    console.log(`✅ Database accessible. Collections: ${collections.length}`);
    
    if (collections.length > 0) {
      console.log('Collection names:', collections.map(c => c.name));
    }
    
    // Try to access bookings collection
    const bookings = db.collection('bookings');
    const count = await bookings.countDocuments();
    console.log(`✅ Bookings collection has ${count} documents`);
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('Error name:', error.name);
    
    if (error.name === 'MongoServerSelectionError') {
      console.log('\n⚠️ Possible issues:');
      console.log('1. MongoDB Atlas cluster may be PAUSED');
      console.log('2. Your IP address is not whitelisted in Network Access');
      console.log('3. Database user credentials are incorrect');
      console.log('4. Cluster name or configuration changed');
      
      console.log('\n🔧 Recommended actions:');
      console.log('1. Go to https://cloud.mongodb.com');
      console.log('2. Check if cluster "Cluster0" is RUNNING (not paused)');
      console.log('3. In Network Access, add your current IP address (0.0.0.0/0 for all)');
      console.log('4. Verify database user "premvatika" exists with correct password');
    }
  } finally {
    await client.close();
    console.log('\nConnection closed.');
  }
}

testConnection();