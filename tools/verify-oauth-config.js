#!/usr/bin/env node

/**
 * Google OAuth Configuration Verification Script
 * 
 * This script verifies that your Google OAuth credentials are properly set up
 * by checking environment variables and validating basic formatting.
 */

// Import dotenv to load environment variables
require('dotenv').config({ path: '.env.local' });

console.log('Google OAuth Configuration Verification');
console.log('=======================================');

// Check GOOGLE_CLIENT_ID
const clientId = process.env.GOOGLE_CLIENT_ID;
if (!clientId) {
  console.error('❌ GOOGLE_CLIENT_ID is not set in .env.local');
} else if (clientId === 'your-google-client-id-here') {
  console.error('❌ GOOGLE_CLIENT_ID has not been replaced with your actual Google OAuth client ID');
} else if (clientId.includes('.apps.googleusercontent.com')) {
  console.log('✅ GOOGLE_CLIENT_ID is properly formatted');
} else {
  console.error('❌ GOOGLE_CLIENT_ID does not match expected format (should end with .apps.googleusercontent.com)');
}

// Check GOOGLE_CLIENT_SECRET
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
if (!clientSecret) {
  console.error('❌ GOOGLE_CLIENT_SECRET is not set in .env.local');
} else if (clientSecret === 'your-google-client-secret-here') {
  console.error('❌ GOOGLE_CLIENT_SECRET has not been replaced with your actual Google OAuth client secret');
} else if (clientSecret.startsWith('GOCSPX-')) {
  console.log('✅ GOOGLE_CLIENT_SECRET is properly formatted');
} else {
  console.warn('⚠️ GOOGLE_CLIENT_SECRET does not start with GOCSPX- (common but not required)');
}

// Check NEXTAUTH_URL
const nextAuthUrl = process.env.NEXTAUTH_URL;
if (!nextAuthUrl) {
  console.error('❌ NEXTAUTH_URL is not set in .env.local');
} else {
  console.log(`✅ NEXTAUTH_URL is set to ${nextAuthUrl}`);
}

// Check NEXTAUTH_SECRET
const nextAuthSecret = process.env.NEXTAUTH_SECRET;
if (!nextAuthSecret) {
  console.error('❌ NEXTAUTH_SECRET is not set in .env.local');
} else if (nextAuthSecret === 'your-very-secure-nextauth-secret-key-replace-this') {
  console.error('❌ NEXTAUTH_SECRET has not been replaced with a secure random string');
} else if (nextAuthSecret.length < 32) {
  console.warn('⚠️ NEXTAUTH_SECRET is less than 32 characters (should be a long random string)');
} else {
  console.log('✅ NEXTAUTH_SECRET is properly set');
}

// Generate help information
console.log('\nFor Google OAuth to work correctly, you need to:');
console.log('1. Create a Google Cloud project: https://console.cloud.google.com/');
console.log('2. Configure the OAuth consent screen');
console.log('3. Create OAuth 2.0 Client ID credentials');
console.log('4. Add authorized redirect URI: http://localhost:3000/api/auth/callback/google');
console.log('\nFor detailed instructions, see the OAuth troubleshooting guide: OAUTH_TROUBLESHOOTING.md');

// Exit with error code if we found issues
if (!clientId || clientId === 'your-google-client-id-here' || 
    !clientSecret || clientSecret === 'your-google-client-secret-here' ||
    !nextAuthUrl || !nextAuthSecret || nextAuthSecret === 'your-very-secure-nextauth-secret-key-replace-this') {
  process.exit(1);
} else {
  console.log('\n✅ All environment variables appear to be configured correctly');
} 