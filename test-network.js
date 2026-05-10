import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

async function testNetwork() {
  console.log('=== Network Connectivity Test ===\n');
  
  // Test 1: Check internet connectivity
  console.log('1. Testing internet connectivity...');
  try {
    const { stdout } = await execAsync('ping -n 2 8.8.8.8');
    console.log('✅ Internet connectivity OK (ping to 8.8.8.8 successful)');
  } catch (error) {
    console.log('❌ Internet connectivity issue:', error.message);
  }
  
  // Test 2: Test DNS resolution for common domains
  console.log('\n2. Testing DNS resolution for common domains...');
  const testDomains = [
    'google.com',
    'github.com',
    'mongodb.com'
  ];
  
  for (const domain of testDomains) {
    try {
      const { stdout } = await execAsync(`nslookup ${domain}`);
      console.log(`✅ ${domain} - DNS resolution OK`);
    } catch (error) {
      console.log(`❌ ${domain} - DNS resolution failed`);
    }
  }
  
  // Test 3: Try to resolve MongoDB Atlas hostname directly
  console.log('\n3. Testing MongoDB Atlas hostname resolution...');
  const mongoHost = 'cluster0.hepaixd.mongodb.net';
  try {
    const { stdout } = await execAsync(`nslookup ${mongoHost}`);
    console.log(`✅ ${mongoHost} - DNS resolution output:`);
    console.log(stdout.substring(0, 500)); // Show first 500 chars
  } catch (error) {
    console.log(`❌ ${mongoHost} - DNS resolution failed:`, error.message);
    
    // Try with Google DNS
    console.log('\n4. Trying with Google DNS (8.8.8.8)...');
    try {
      const { stdout } = await execAsync(`nslookup ${mongoHost} 8.8.8.8`);
      console.log(`✅ ${mongoHost} - Resolution with Google DNS OK:`);
      console.log(stdout.substring(0, 500));
    } catch (error2) {
      console.log(`❌ ${mongoHost} - Even Google DNS failed:`, error2.message);
    }
  }
  
  // Test 4: Check if we can connect to MongoDB Atlas IP directly
  console.log('\n5. Testing if MongoDB Atlas cluster exists...');
  console.log('Note: If the cluster was deleted or paused, this will fail.');
  console.log('Check your MongoDB Atlas dashboard:');
  console.log('1. Go to https://cloud.mongodb.com');
  console.log('2. Check if cluster "Cluster0" is running (not paused)');
  console.log('3. Check Network Access - your IP should be whitelisted');
  console.log('4. Check Database Access - user "premvatika" should have access');
}

testNetwork().catch(console.error);