import { MongoClient } from 'mongodb';

console.log('=== Testing Old Cluster Name ===\n');

// Test the old cluster name from test-mongodb-direct.js
const oldClusterUri = 'mongodb+srv://premvatika:PremVatika5123@cluster0.hepaixd.mongodb.net/?appName=Cluster0';

console.log('Testing old cluster: cluster0.hepaixd.mongodb.net');
console.log('URI (masked):', oldClusterUri.replace(/:[^:@]+@/, ':****@'));

const client = new MongoClient(oldClusterUri, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 30000,
});

try {
  console.log('\nConnecting...');
  await client.connect();
  console.log('✅ CONNECTED to old cluster!');
  
  const db = client.db();
  console.log(`Database: ${db.databaseName}`);
  
  const collections = await db.listCollections().toArray();
  console.log(`Collections: ${collections.length}`);
  
  if (collections.length > 0) {
    console.log('Collection names:', collections.map(c => c.name).join(', '));
  }
  
  console.log('\n🎉 The old cluster exists! You might need to:');
  console.log('1. Use this cluster instead');
  console.log('2. Update your .env file with the correct URI');
  console.log('3. Or if you created a new cluster, get its correct connection string');
  
} catch (error) {
  console.log(`\n❌ Failed to connect to old cluster: ${error.message}`);
  
  if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
    console.log('\nNeither cluster exists. Possible scenarios:');
    console.log('1. Both clusters were deleted');
    console.log('2. Clusters are paused');
    console.log('3. You need to create a new cluster');
    console.log('\nAction required:');
    console.log('1. Go to https://cloud.mongodb.com');
    console.log('2. Check if you have any active clusters');
    console.log('3. Create a new cluster if needed');
    console.log('4. Get the connection string from "Connect" button');
  } else if (error.message.includes('authentication failed')) {
    console.log('\nCluster exists but authentication failed');
    console.log('Check username/password');
  }
} finally {
  await client.close();
}

console.log('\n=== Test Complete ===');