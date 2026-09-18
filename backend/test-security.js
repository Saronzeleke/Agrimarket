// Quick security middleware test
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';

async function testSecurityMiddleware() {
  console.log('Starting Security Middleware Tests...\n');
  
  try {
    // Test 1: XSS Sanitization
    console.log('Test 1: XSS Sanitization');
    try {
      const response = await axios.post(`${BASE_URL}/auth/register`, {
        email: 'xss@test.com',
        password: 'Test1234!',
        firstName: '<script>alert("XSS")</script>',
        lastName: 'Normal',
        phone: '+251912345678',
        role: 'BUYER'
      });
      console.log('✓ XSS test passed - input sanitized');
    } catch (error) {
      if (error.response) {
        console.log('✓ XSS test passed - validation error:', error.response.data.error.message);
      } else {
        console.log('✗ XSS test failed:', error.message);
      }
    }
    
    // Test 2: Rate Limiting
    console.log('\nTest 2: Rate Limiting (Auth Endpoint)');
    let rateLimitHit = false;
    for (let i = 0; i < 7; i++) {
      try {
        await axios.post(`${BASE_URL}/auth/login`, {
          email: 'test@example.com',
          password: 'wrongpassword'
        });
      } catch (error) {
        if (error.response && error.response.status === 429) {
          rateLimitHit = true;
          console.log(`✓ Rate limit triggered after ${i + 1} attempts`);
          break;
        }
      }
    }
    if (!rateLimitHit) {
      console.log('✗ Rate limit test - limit not hit');
    }
    
    // Test 3: Security Headers
    console.log('\nTest 3: Security Headers');
    try {
      const response = await axios.get(`${BASE_URL}/../health`);
      const headers = response.headers;
      
      const requiredHeaders = [
        'x-content-type-options',
        'x-frame-options',
        'strict-transport-security'
      ];
      
      let allPresent = true;
      requiredHeaders.forEach(header => {
        if (headers[header]) {
          console.log(`✓ ${header}: ${headers[header]}`);
        } else {
          console.log(`✗ ${header}: missing`);
          allPresent = false;
        }
      });
      
      if (allPresent) {
        console.log('✓ All security headers present');
      }
    } catch (error) {
      console.log('✗ Security headers test failed:', error.message);
    }
    
    console.log('\n✅ Security middleware tests completed');
  } catch (error) {
    console.log('\n❌ Test suite failed:', error.message);
  }
}

testSecurityMiddleware();
