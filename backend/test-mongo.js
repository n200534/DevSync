require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔍 Testing MongoDB Connection...');
console.log('Environment:', process.env.NODE_ENV);

// Check if MONGODB_URI exists
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env file');
  process.exit(1);
}

console.log('📋 MONGODB_URI found in .env');
console.log('🔐 URI length:', process.env.MONGODB_URI.length);
console.log('🔐 URI starts with:', process.env.MONGODB_URI.substring(0, 20) + '...');

// Test the connection
async function testConnection() {
  try {
    console.log('🔄 Attempting to connect...');
    
    // Set connection options
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
    
    await mongoose.connect(process.env.MONGODB_URI, options);
    
    console.log('✅ MongoDB connected successfully!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('🔌 Port:', mongoose.connection.port);
    
    await mongoose.connection.close();
    console.log('🔌 Connection closed');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 This suggests a DNS resolution issue.');
      console.log('   Check if your connection string is correct.');
      console.log('   Make sure there are no extra characters or spaces.');
    }
    
    if (error.message.includes('Authentication failed')) {
      console.log('\n💡 This suggests authentication issues.');
      console.log('   Check your username and password.');
      console.log('   Make sure your IP is whitelisted in Atlas.');
    }
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 This suggests network connectivity issues.');
      console.log('   Check if your cluster is running.');
      console.log('   Check if your IP is whitelisted.');
    }
  }
}

testConnection();
