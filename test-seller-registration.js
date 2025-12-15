const axios = require('axios');

// Simulate the seller registration flow with corrected field mapping
async function testSellerRegistration() {
  try {
    console.log('Testing seller registration flow...');
    
    // 1. Register a new seller with corrected field mapping
    console.log('\n1. Registering new seller...');
    const sellerData = {
      name: 'New Seller Test User',
      email: 'newseller@example.com',
      password: 'password123',
      phone: '+966501234568',
      companyName: 'New Test Company Ltd.',
      businessType: 'wholesaler',
      taxId: '300123456700004',
      businessAddress: {
        street: '456 New Business Street',
        city: 'Jeddah',
        region: 'Makkah Region',
        postalCode: '21564',
        country: 'Saudi Arabia'
      }
    };
    
    console.log('Sending data:', JSON.stringify(sellerData, null, 2));
    
    const registerResponse = await axios.post('http://localhost:5000/api/auth/seller/register', sellerData);
    
    console.log('Seller registration response:', registerResponse.data);
    
    if (registerResponse.data.success) {
      console.log('✅ Seller registration successful!');
      console.log('Seller ID:', registerResponse.data.data.id);
      console.log('Approval Status:', registerResponse.data.data.approvalStatus);
    } else {
      console.log('❌ Seller registration failed:', registerResponse.data.message);
      return;
    }
    
    // 2. Try to login as seller (should fail if pending approval)
    console.log('\n2. Attempting to login as seller...');
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'newseller@example.com',
        password: 'password123'
      });
      
      console.log('Login response:', loginResponse.data);
    } catch (loginError) {
      console.log('Login failed as expected (likely pending approval):', loginError.response?.data);
    }
    
    console.log('\n✅ Seller registration test completed.');
    
  } catch (error) {
    console.error('❌ Test failed:');
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

testSellerRegistration();