import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== MongoDB URI Update Helper ===\n');

// Read current .env file
const envPath = path.join(__dirname, '.env');
let envContent = '';

try {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ Current .env file loaded');
} catch (error) {
  console.error('❌ Could not read .env file:', error.message);
  process.exit(1);
}

// Extract current MONGO_URI
const mongoUriMatch = envContent.match(/MONGO_URI=(.+)/);
const currentUri = mongoUriMatch ? mongoUriMatch[1] : '';

if (!currentUri) {
  console.log('❌ MONGO_URI not found in .env file');
} else {
  console.log('Current MONGO_URI (masked):', currentUri.replace(/:[^:@]+@/, ':****@'));
  
  // Extract cluster name
  const clusterMatch = currentUri.match(/@([^/?]+)/);
  const clusterName = clusterMatch ? clusterMatch[1] : 'unknown';
  console.log(`Current cluster: ${clusterName}`);
}

console.log('\n' + '='.repeat(60));
console.log('INSTRUCTIONS: How to get correct MongoDB Atlas connection string');
console.log('='.repeat(60));

console.log('\n1. Go to https://cloud.mongodb.com');
console.log('2. Sign in to your account');
console.log('3. Find your cluster (look for "PremVatika" or similar)');
console.log('4. Click "Connect" on your cluster');
console.log('5. Choose "Drivers" (for Node.js)');
console.log('6. Copy the connection string');
console.log('7. It should look like:');
console.log('   mongodb+srv://username:password@cluster-name.mongodb.net/');
console.log('\n8. Update your .env file with the new URI');

console.log('\n' + '='.repeat(60));
console.log('QUICK UPDATE (optional)');
console.log('='.repeat(60));

console.log('\nIf you have your new connection string, you can:');
console.log('1. Manually edit the .env file');
console.log('2. Or run this command to update:');
console.log('\n   node -e "');
console.log('     const fs = require(\"fs\");');
console.log('     let content = fs.readFileSync(\".env\", \"utf8\");');
console.log('     content = content.replace(/MONGO_URI=.*/, \"MONGO_URI=YOUR_NEW_URI_HERE\");');
console.log('     fs.writeFileSync(\".env\", content);');
console.log('     console.log(\"✅ .env file updated\");');
console.log('   "');

console.log('\n' + '='.repeat(60));
console.log('VERIFICATION');
console.log('='.repeat(60));

console.log('\nAfter updating .env, test your connection:');
console.log('   node test-connection-diagnostic.js');
console.log('\nOr start the server:');
console.log('   npm start');

console.log('\n' + '='.repeat(60));
console.log('TROUBLESHOOTING');
console.log('='.repeat(60));

console.log('\nIf connection still fails:');
console.log('1. Check cluster is RUNNING (not paused)');
console.log('2. Verify IP is whitelisted in Network Access');
console.log('3. Ensure database user exists with correct password');
console.log('4. Try the standard connection string (non-SRV)');

console.log('\nStandard connection string format:');
console.log('mongodb://username:password@cluster-shard-00-00.abc123.mongodb.net:27017,cluster-shard-00-01.abc123.mongodb.net:27017,cluster-shard-00-02.abc123.mongodb.net:27017/database?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority');

console.log('\n' + '='.repeat(60));
console.log('SUPPORT');
console.log('='.repeat(60));

console.log('\nFor more help, see:');
console.log('- MONGODB_SETUP_GUIDE.md (in this folder)');
console.log('- MongoDB Atlas documentation: https://docs.atlas.mongodb.com');
console.log('- Test scripts: test-connection-diagnostic.js, test-all-connections.js');

console.log('\n✅ Helper script complete. Follow the instructions above.');