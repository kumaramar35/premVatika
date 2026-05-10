# MongoDB Atlas Connection Setup Guide

## Current Issue
Your MongoDB Atlas connection is failing because the cluster domain `premvatika.5dx3qcd.mongodb.net` does not exist or cannot be resolved.

## Diagnosis Results
- ❌ DNS resolution failed for `premvatika.5dx3qcd.mongodb.net`
- ❌ Old cluster `cluster0.hepaixd.mongodb.net` also doesn't exist
- Possible causes: Cluster deleted, paused, or incorrect connection string

## Solution Options

### Option 1: Fix Existing Cluster (Recommended)
1. **Log in to MongoDB Atlas**
   - Go to https://cloud.mongodb.com
   - Sign in with your account

2. **Check if cluster exists**
   - Look for a cluster named "PremVatika" or similar
   - If it exists, check if it's **RUNNING** (not paused)

3. **Get correct connection string**
   - Click "Connect" on your cluster
   - Choose "Drivers" (Node.js)
   - Copy the connection string
   - It should look like:
     ```
     mongodb+srv://username:password@cluster-name.mongodb.net/
     ```

4. **Update your .env file**
   - Open `premBackend/premVatika/.env`
   - Replace the `MONGO_URI` line with your new connection string
   - Example:
     ```
     MONGO_URI=mongodb+srv://premvatika:YourActualPassword@premvatika.abc123.mongodb.net/?appName=PremVatika
     ```

5. **Whitelist your IP address**
   - In MongoDB Atlas, go to "Network Access"
   - Add your current IP address
   - Or add `0.0.0.0/0` to allow all IPs (less secure)

### Option 2: Create New Cluster
1. **Create free cluster**
   - Go to https://cloud.mongodb.com
   - Click "Create" or "Build a Database"
   - Choose FREE tier (M0)
   - Choose provider/region (AWS, Mumbai recommended)
   - Name cluster: `PremVatika`

2. **Create database user**
   - Username: `premvatika`
   - Password: Choose a strong password
   - Save credentials

3. **Set up network access**
   - Add IP address: `0.0.0.0/0` (allow all)
   - Or add your specific IP

4. **Load sample data**
   - Click "Browse Collections"
   - Click "Add My Own Data"
   - Database name: `premvatika`
   - Collection name: `bookings`
   - Upload your sample data

5. **Get connection string**
   - Click "Connect" → "Drivers" → "Node.js"
   - Copy connection string
   - Update `.env` file

### Option 3: Use Local MongoDB (Development Only)
1. **Install MongoDB locally**
   - Download from https://www.mongodb.com/try/download/community
   - Install on your computer
   - Start MongoDB service

2. **Update .env file**
   ```
   MONGO_URI=mongodb://localhost:27017/premvatika
   ```

3. **Create database and collections**
   - Use MongoDB Compass or command line
   - Create database `premvatika`
   - Create collection `bookings`

## Testing Your Connection

After updating your `.env` file, test the connection:

```bash
cd premBackend/premVatika
node test-connection-diagnostic.js
```

Or start the server:
```bash
npm start
```

## Common Issues & Fixes

### 1. "DNS resolution failed" or "ENOTFOUND"
- Cluster doesn't exist
- Cluster is paused
- Typo in cluster name
- **Fix**: Check cluster exists and is running in MongoDB Atlas

### 2. "Authentication failed"
- Incorrect username/password
- Database user doesn't exist
- **Fix**: Create correct database user in MongoDB Atlas

### 3. "IP not whitelisted"
- Your IP address is not in Network Access list
- **Fix**: Add your IP to MongoDB Atlas Network Access

### 4. "Cluster paused"
- Free clusters auto-pause after inactivity
- **Fix**: Resume cluster in MongoDB Atlas dashboard

## Quick Test Scripts

We've created these test scripts to help diagnose:

1. `test-connection-diagnostic.js` - Detailed diagnostics
2. `test-all-connections.js` - Tests multiple connection methods
3. `test-old-cluster.js` - Tests previous cluster name

## Next Steps

1. Choose one of the solutions above
2. Update your `.env` file with correct MongoDB URI
3. Test connection with diagnostic scripts
4. Restart your server: `npm start`
5. Verify API endpoints work with database

## Support

If you continue to have issues:
1. Check MongoDB Atlas dashboard for cluster status
2. Verify `.env` file has correct MONGO_URI
3. Ensure no typos in username/password/cluster name
4. Test with `test-connection-diagnostic.js` for specific error messages

## Success Indicators

When connection is successful, you'll see:
```
✅ MongoDB Atlas (cloud) Connected successfully
Database: premvatika
Connection state: Connected