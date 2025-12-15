const axios = require('axios');

async function testRegistration() {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/buyer/register', {
      name: 'Test User',
      email: 'test2@example.com',
      password: 'password123',
      phone: '+1234567890'
    });
    
    console.log('Registration response:', response.data);
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
  }
}

testRegistration();