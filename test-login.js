const axios = require('axios');

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test2@example.com',
      password: 'password123'
    });
    
    console.log('Login response:', response.data);
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
  }
}

testLogin();