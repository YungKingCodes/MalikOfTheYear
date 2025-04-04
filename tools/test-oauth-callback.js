#!/usr/bin/env node

/**
 * Google OAuth Callback Test Script
 * 
 * This script tests the Google OAuth callback configuration by:
 * 1. Checking if the NEXTAUTH_URL environment variable is correctly set
 * 2. Verifying the callback URL format that should be configured in Google Cloud Console
 * 3. Performing a basic connection test to ensure the callback URL is accessible
 */

require('dotenv').config({ path: '.env.local' });
const http = require('http');
const https = require('https');
const { URL } = require('url');

console.log('Google OAuth Callback Test');
console.log('=========================');

// Get NEXTAUTH_URL from environment
const nextAuthUrl = process.env.NEXTAUTH_URL;
if (!nextAuthUrl) {
  console.error('❌ NEXTAUTH_URL is not set in .env.local');
  process.exit(1);
}

// Create full callback URL
const callbackUrl = `${nextAuthUrl}/api/auth/callback/google`;
console.log(`\nExpected callback URL: ${callbackUrl}`);
console.log('This is the URL you must configure in your Google Cloud Console');
console.log('Under: APIs & Services > Credentials > OAuth 2.0 Client IDs > Authorized redirect URIs');

// Parse URL for validation
try {
  const parsedUrl = new URL(callbackUrl);
  console.log('\n✅ Callback URL format is valid');
  
  // Check if URL uses HTTPS in production
  if (parsedUrl.protocol === 'http:' && nextAuthUrl.includes('.com')) {
    console.warn('⚠️ Warning: In production, you should use HTTPS for security');
  }
  
  // Test callback endpoint accessibility
  console.log('\nTesting callback endpoint accessibility...');
  const client = parsedUrl.protocol === 'https:' ? https : http;
  
  const request = client.get(`${parsedUrl.protocol}//${parsedUrl.host}/api/auth/test-env`, (res) => {
    console.log(`Response status: ${res.statusCode}`);
    
    if (res.statusCode >= 200 && res.statusCode < 400) {
      console.log('✅ NextAuth.js server is accessible');
    } else {
      console.warn(`⚠️ Received status code ${res.statusCode}. This may indicate a problem with your NextAuth.js setup.`);
    }
    
    // Final recommendations
    console.log('\nNext steps:');
    console.log('1. Ensure your Google OAuth credentials are correctly set up');
    console.log('2. Check that the redirect URI is exactly as shown above');
    console.log('3. Make sure your application is running when testing OAuth');
    console.log('4. Clear browser cookies if you encounter persistent issues');
    console.log('\nFor more details, see OAUTH_TROUBLESHOOTING.md');
  });
  
  request.on('error', (err) => {
    console.error(`❌ Connection error: ${err.message}`);
    console.error('Make sure your server is running at the NEXTAUTH_URL specified in .env.local');
  });
  
  request.end();
  
} catch (error) {
  console.error(`❌ Invalid callback URL format: ${error.message}`);
  process.exit(1);
} 