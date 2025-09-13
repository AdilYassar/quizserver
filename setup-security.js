import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

console.log('🔐 Setting up security configuration for Quiz Server\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
const envExamplePath = path.join(process.cwd(), '.env.example');

// Generate secure secrets
const accessSecret = crypto.randomBytes(64).toString('hex');
const refreshSecret = crypto.randomBytes(64).toString('hex');

const envContent = `# Quiz Server Security Configuration
# Generated on: ${new Date().toISOString()}

# JWT Secrets (DO NOT SHARE THESE)
ACCESS_TOKEN_SECRET=${accessSecret}
REFRESH_TOKEN_SECRET=${refreshSecret}

# JWT Token Expiry (optional - defaults provided)
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Environment
NODE_ENV=development

# Database Configuration (add your MongoDB connection string)
MONGODB_URI=mongodb://localhost:27017/quizserver

# Server Configuration
PORT=3000
`;

// Create .env.example file
fs.writeFileSync(envExamplePath, envContent);
console.log('✅ Created .env.example file');

// Check if .env already exists
if (fs.existsSync(envPath)) {
    console.log('⚠️  .env file already exists');
    
    // Check if secrets are already set
    const existingEnv = fs.readFileSync(envPath, 'utf8');
    if (existingEnv.includes('ACCESS_TOKEN_SECRET=') && existingEnv.includes('REFRESH_TOKEN_SECRET=')) {
        console.log('✅ JWT secrets are already configured');
    } else {
        console.log('❌ JWT secrets are missing from .env file');
        console.log('📝 Please add the following to your .env file:');
        console.log(`ACCESS_TOKEN_SECRET=${accessSecret}`);
        console.log(`REFRESH_TOKEN_SECRET=${refreshSecret}`);
    }
} else {
    // Create .env file
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env file with secure JWT secrets');
}

console.log('\n🔒 Security Setup Complete!');
console.log('\n📋 Next Steps:');
console.log('1. Review the .env file and update any configuration as needed');
console.log('2. Ensure your MongoDB connection string is correct');
console.log('3. Run the server: npm start');
console.log('4. Test the security implementation: node test-secure-auth.js');

console.log('\n⚠️  Security Reminders:');
console.log('- Never commit .env file to version control');
console.log('- Use different secrets for production');
console.log('- Regularly rotate JWT secrets in production');
console.log('- Monitor logs for suspicious activity');

console.log('\n📚 Documentation:');
console.log('- Security Implementation Guide: SECURITY_IMPLEMENTATION.md');
console.log('- API Documentation: Check individual route files');
