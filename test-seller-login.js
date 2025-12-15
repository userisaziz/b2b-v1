const axios = require('axios');

// Test seller login
async function testSellerLogin() {
  try {
    console.log('Testing seller login flow...');
    
    // Try to login as seller
    console.log('\n1. Attempting to login as seller...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'newseller@example.com',
      password: 'password123'
    });
    
    console.log('Login response:', loginResponse.data);
    
  } catch (error) {
    console.error('Login test result:');
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('Request data:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
  }
}

testSellerLogin();