const axios = require('axios');

// Test seller profile access
async function testSellerProfile() {
  try {
    console.log('Testing seller profile access...');
    
    // First, login to get a token
    console.log('\n1. Logging in as seller...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'newseller@example.com',
      password: 'password123'
    });
    
    console.log('Login response status:', loginResponse.status);
    console.log('Login response data:', loginResponse.data);
    
    if (loginResponse.data.token) {
      console.log('\n2. Accessing seller profile with token...');
      const profileResponse = await axios.get('http://localhost:5000/api/sellers/profile', {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.token}`
        }
      });
      
      console.log('Profile response status:', profileResponse.status);
      console.log('Profile response data:', profileResponse.data);
    } else {
      console.log('No token received from login');
    }
    
  } catch (error) {
    console.error('Test result:');
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

testSellerProfile();