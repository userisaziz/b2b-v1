const axios = require('axios');

async function testProfile() {
  try {
    // First login to get the token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test2@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('Token received:', token.substring(0, 20) + '...');
    
    // Now test the profile endpoint
    const profileResponse = await axios.get('http://localhost:5000/api/auth/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Profile response:', profileResponse.data);
  } catch (error) {
    console.error('Profile error:', error.response?.data || error.message);
  }
}

testProfile();