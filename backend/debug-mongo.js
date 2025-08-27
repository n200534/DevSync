require('dotenv').config();

console.log('🔍 Detailed MongoDB Connection String Analysis...');
console.log('================================================');

// Check if MONGODB_URI exists
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env file');
  process.exit(1);
}

const uri = process.env.MONGODB_URI;

console.log('📋 MONGODB_URI found in .env');
console.log('🔐 Total length:', uri.length);
console.log('🔐 Full URI:', uri);
console.log('');

// Check for common issues
console.log('🔍 Checking for common issues:');
console.log('');

// Check if it starts correctly
if (uri.startsWith('mongodb+srv://')) {
  console.log('✅ Starts with mongodb+srv://');
} else if (uri.startsWith('mongodb://')) {
  console.log('✅ Starts with mongodb://');
} else {
  console.log('❌ Does not start with mongodb:// or mongodb+srv://');
}

// Check for @ symbol (should have exactly one)
const atCount = (uri.match(/@/g) || []).length;
if (atCount === 1) {
  console.log('✅ Contains exactly one @ symbol');
} else {
  console.log(`❌ Contains ${atCount} @ symbols (should be 1)`);
}

// Check for .mongodb.net (should be present)
if (uri.includes('.mongodb.net')) {
  console.log('✅ Contains .mongodb.net');
} else {
  console.log('❌ Missing .mongodb.net');
}

// Check for database name
if (uri.includes('/devsync') || uri.includes('/test') || uri.includes('/development')) {
  console.log('✅ Contains database name');
} else {
  console.log('❌ Missing database name');
}

// Check for special characters that might cause issues
const specialChars = ['\n', '\r', '\t', ' '];
specialChars.forEach(char => {
  if (uri.includes(char)) {
    console.log(`❌ Contains special character: ${JSON.stringify(char)}`);
  }
});

// Check for any numbers that might be causing the 321 issue
const numbers = uri.match(/\d+/g) || [];
if (numbers.length > 0) {
  console.log('🔢 Numbers found in URI:', numbers);
}

console.log('');
console.log('🔍 URI breakdown:');

// Split by @ to see username:password and host parts
const parts = uri.split('@');
if (parts.length === 2) {
  const credentials = parts[0].replace('mongodb+srv://', '').replace('mongodb://', '');
  const hostPart = parts[1];
  
  console.log('👤 Credentials part:', credentials);
  console.log('🌐 Host part:', hostPart);
  
  // Check if host part looks correct
  if (hostPart.includes('.mongodb.net')) {
    console.log('✅ Host part looks correct');
  } else {
    console.log('❌ Host part looks incorrect');
    console.log('   Expected format: cluster.mongodb.net/database');
  }
} else {
  console.log('❌ Cannot parse URI structure');
}

console.log('');
console.log('💡 Recommendations:');
console.log('1. Copy a fresh connection string from MongoDB Atlas');
console.log('2. Make sure there are no extra spaces or characters');
console.log('3. Check that the string is on a single line');
console.log('4. Verify your username and password are correct');
console.log('5. Ensure your IP is whitelisted in Atlas');
