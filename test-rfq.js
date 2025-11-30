const axios = require('axios');

async function testPublicRFQ() {
  try {
    const response = await axios.post('http://localhost:5000/api/rfqs/public', {
      title: 'Test RFQ',
      description: 'This is a test RFQ',
      category_id: '6923677f3b274a21694261cf',
      contact_name: 'John Doe',
      contact_email: 'john@example.com',
      contact_phone: '1234567890'
    });
    
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testPublicRFQ();