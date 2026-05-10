import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

const uri = process.env.MONGO_URI;

console.log('=== Testing MongoDB Atlas Connection ===');
console.log('URI (masked):', uri.replace(/:[^:@]+@/, ':****@'));

// Test DNS resolution first
console.log('\n1. Testing DNS resolution...');
const hostname = 'cluster0.hepaixd.mongodb.net';

dns.resolveSrv(`_mongodb._tcp.${hostname}`, (err, addresses) => {
  if (err) {
    console.error('❌ DNS SRV resolution failed:', err.message);
    console.error('Error code:', err.code);
    
    // Try regular DNS lookup
    console.log('\nTrying regular DNS lookup...');
    dns.lookup(hostname, (err, address, family) => {
      if (err) {
        console.error('❌ Regular DNS lookup failed:', err.message);
      } else {
        console.log(`✅ Regular DNS lookup successful: ${address} (IPv${family})`);
      }
      
      // Test direct connection
      testDirectConnection();
    });
  } else {
    console.log('✅ DNS SRV resolution successful');
    console.log('Addresses:', addresses);
    testDirectConnection();
  }
});

function testDirectConnection() {
  console.log('\n2. Testing direct MongoDB connection...');
  
  // Try with connection options
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
  });
  
  async function connect() {
    try {
      console.log('Attempting to connect...');
      await client.connect();
      console.log('✅ Connected to MongoDB Atlas successfully!');
      
      // Test a simple operation
      const db = client.db();
      const collections = await db.listCollections().toArray();
      console.log(`✅ Database accessible. Collections: ${collections.length}`);
      
      // Check if our database exists
      const adminDb = client.db('premvatika');
      const stats = await adminDb.stats();
      console.log(`✅ Database 'premvatika' exists. Size: ${stats.dataSize} bytes`);
      
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      console.error('Full error:', error);
      
      if (error.name === 'MongoServerSelectionError') {
        console.log('\n⚠️ Possible issues:');
        console.log('1. MongoDB Atlas cluster may be paused or not running');
        console.log('2. Network firewall blocking connection (port 27017)');
        console.log('3. IP not whitelisted in MongoDB Atlas network access');
        console.log('4. Incorrect credentials or cluster name');
      }
    } finally {
      await client.close();
      console.log('\nConnection closed.');
    }
  }
  
  connect();
}