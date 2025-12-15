const axios = require('axios');

// Simulate the storefront registration flow
async function testStorefrontRegistration() {
  try {
    console.log('Testing storefront registration flow...');
    
    // 1. Register a new buyer
    console.log('\n1. Registering new buyer...');
    const registerResponse = await axios.post('http://localhost:5000/api/auth/buyer/register', {
      name: 'Storefront Test User',
      email: 'storefront@test.com',
      password: 'password123',
      phone: '+9876543210'
    });
    
    console.log('Registration successful:', {
      success: registerResponse.data.success,
      message: registerResponse.data.message,
      userId: registerResponse.data.data.id,
      userEmail: registerResponse.data.data.email
    });
    
    // 2. Login with the new user
    console.log('\n2. Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'storefront@test.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('Login successful, token received (first 20 chars):', token.substring(0, 20) + '...');
    
    // 3. Get user profile
    console.log('\n3. Fetching user profile...');
    const profileResponse = await axios.get('http://localhost:5000/api/auth/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Profile fetched:', {
      name: profileResponse.data.user.name,
      email: profileResponse.data.user.email,
      role: profileResponse.data.user.role
    });
    
    console.log('\n✅ All tests passed! Storefront registration flow is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testStorefrontRegistration();