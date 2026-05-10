import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import dns from 'dns';
import { promisify } from 'util';

dotenv.config();

const uri = process.env.MONGO_URI || 'mongodb+srv://premvatika:PremVatika5123@premvatika.5dx3qcd.mongodb.net/?appName=PremVatika';

console.log('=== MongoDB Connection Diagnostic ===');
console.log('URI (masked):', uri.replace(/:[^:@]+@/, ':****@'));

// Extract hostname from URI
const hostnameMatch = uri.match(/@([^/?]+)/);
const hostname = hostnameMatch ? hostnameMatch[1] : '';

console.log('\n1. Parsing URI details:');
console.log('   - Full URI:', uri);
console.log('   - Hostname:', hostname);
console.log('   - Using SRV:', uri.includes('mongodb+srv://'));

// Test DNS resolution
console.log('\n2. Testing DNS resolution...');
const resolveSrv = promisify(dns.resolveSrv);
const lookup = promisify(dns.lookup);

try {
  const srvHostname = `_mongodb._tcp.${hostname}`;
  console.log(`   - SRV record: ${srvHostname}`);
  
  const addresses = await resolveSrv(srvHostname);
  console.log('   ✅ DNS SRV resolution successful');
  console.log('   - Addresses:', JSON.stringify(addresses, null, 2));
} catch (srvError) {
  console.log(`   ❌ DNS SRV resolution failed: ${srvError.message}`);
  console.log(`   - Error code: ${srvError.code}`);
  
  // Try regular DNS lookup
  try {
    console.log('\n3. Testing regular DNS lookup...');
    const result = await lookup(hostname);
    console.log(`   ✅ Regular DNS lookup successful: ${result.address} (IPv${result.family})`);
  } catch (lookupError) {
    console.log(`   ❌ Regular DNS lookup failed: ${lookupError.message}`);
    console.log(`   - Error code: ${lookupError.code}`);
  }
}

// Test direct connection
console.log('\n4. Testing direct MongoDB connection...');
const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 15000,
});

try {
  console.log('   Attempting to connect...');
  await client.connect();
  console.log('   ✅ Connected to MongoDB Atlas successfully!');
  
  // Test database operations
  const db = client.db();
  console.log(`   - Database name: ${db.databaseName}`);
  
  const collections = await db.listCollections().toArray();
  console.log(`   - Collections count: ${collections.length}`);
  
  if (collections.length > 0) {
    console.log('   - Collection names:', collections.map(c => c.name).join(', '));
  }
  
  // Try to ping the database
  const pingResult = await db.command({ ping: 1 });
  console.log('   ✅ Database ping successful:', pingResult);
  
} catch (error) {
  console.error(`   ❌ MongoDB connection failed: ${error.message}`);
  console.error(`   - Error name: ${error.name}`);
  console.error(`   - Error code: ${error.code}`);
  
  if (error.name === 'MongoServerSelectionError') {
    console.log('\n   ⚠️ Possible issues:');
    console.log('   1. MongoDB Atlas cluster may be PAUSED');
    console.log('   2. Your IP address is not whitelisted in Network Access');
    console.log('   3. Database user credentials are incorrect');
    console.log('   4. Cluster name or configuration changed');
    console.log('   5. Network firewall blocking port 27017');
    
    console.log('\n   🔧 Recommended actions:');
    console.log('   1. Go to https://cloud.mongodb.com');
    console.log('   2. Check if your cluster is running (not paused)');
    console.log('   3. In Network Access, add your current IP address (or 0.0.0.0/0 for all)');
    console.log('   4. Verify database user credentials');
    console.log('   5. Try using standard connection string (non-SRV)');
  }
} finally {
  await client.close();
  console.log('\nConnection closed.');
}

console.log('\n=== Diagnostic Complete ===');