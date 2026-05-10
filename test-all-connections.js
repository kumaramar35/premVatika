import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

console.log('=== Testing All MongoDB Connection Methods ===\n');

// Your current SRV URI
const srvUri = 'mongodb+srv://premvatika:PremVatika5123@premvatika.5dx3qcd.mongodb.net/?appName=PremVatika';

// Try alternative cluster names (common patterns)
const testUris = [
  {
    name: 'Current SRV URI',
    uri: srvUri,
    description: 'Your current connection string'
  },
  {
    name: 'Standard URI (guessed)',
    uri: 'mongodb://premvatika:PremVatika5123@premvatika.5dx3qcd.mongodb.net:27017/premvatika?ssl=true&retryWrites=true&w=majority&appName=PremVatika',
    description: 'Standard connection on port 27017'
  },
  {
    name: 'With database name',
    uri: 'mongodb+srv://premvatika:PremVatika5123@premvatika.5dx3qcd.mongodb.net/premvatika?retryWrites=true&w=majority&appName=PremVatika',
    description: 'SRV with explicit database name'
  },
  {
    name: 'Simplified',
    uri: 'mongodb+srv://premvatika:PremVatika5123@premvatika.5dx3qcd.mongodb.net/',
    description: 'SRV without appName'
  }
];

async function testConnection(name, uri, description) {
  console.log(`\n--- Testing: ${name} ---`);
  console.log(`Description: ${description}`);
  console.log(`URI (masked): ${uri.replace(/:[^:@]+@/, ':****@')}`);
  
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 30000,
    connectTimeoutMS: 10000,
  });
  
  try {
    console.log('Connecting...');
    await client.connect();
    console.log('✅ CONNECTION SUCCESSFUL!');
    
    // Test database access
    const db = client.db();
    console.log(`- Connected to database: ${db.databaseName}`);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log(`- Collections found: ${collections.length}`);
    
    if (collections.length > 0) {
      console.log(`- Collection names: ${collections.slice(0, 5).map(c => c.name).join(', ')}${collections.length > 5 ? '...' : ''}`);
    }
    
    // Ping
    await db.command({ ping: 1 });
    console.log('- Database ping successful');
    
    return { success: true, dbName: db.databaseName, collections: collections.length };
  } catch (error) {
    console.log(`❌ CONNECTION FAILED: ${error.message}`);
    console.log(`- Error type: ${error.name}`);
    
    if (error.name === 'MongoServerSelectionError') {
      console.log('- This is a server selection error - cluster may not exist or IP not whitelisted');
    } else if (error.message.includes('authentication failed')) {
      console.log('- Authentication failed - check username/password');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.log('- DNS resolution failed - cluster domain may not exist');
    }
    
    return { success: false, error: error.message };
  } finally {
    await client.close();
  }
}

async function runAllTests() {
  console.log('Starting connection tests...\n');
  
  let anySuccess = false;
  
  for (const test of testUris) {
    const result = await testConnection(test.name, test.uri, test.description);
    
    if (result.success) {
      anySuccess = true;
      console.log(`\n🎉 SUCCESS! Working connection found: ${test.name}`);
      console.log(`Working URI: ${test.uri.replace(/:[^:@]+@/, ':****@')}`);
      break;
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (!anySuccess) {
    console.log('\n❌ ALL CONNECTION TESTS FAILED');
    console.log('\nPossible issues:');
    console.log('1. Cluster "premvatika.5dx3qcd.mongodb.net" does not exist');
    console.log('2. Cluster is paused in MongoDB Atlas');
    console.log('3. Your IP address is not whitelisted');
    console.log('4. Incorrect username/password');
    console.log('5. Network/DNS issues');
    
    console.log('\n🔧 Recommended actions:');
    console.log('1. Go to https://cloud.mongodb.com and log in');
    console.log('2. Check if cluster "PremVatika" exists and is running');
    console.log('3. In Network Access, add your IP address (or 0.0.0.0/0 for all)');
    console.log('4. Verify database user "premvatika" exists with correct password');
    console.log('5. Get the correct connection string from MongoDB Atlas:');
    console.log('   - Click "Connect" on your cluster');
    console.log('   - Choose "Drivers"');
    console.log('   - Copy the Node.js connection string');
    console.log('   - Update your .env file with the new URI');
  } else {
    console.log('\n✅ Connection successful! Update your .env file with the working URI.');
  }
}

runAllTests().catch(console.error);