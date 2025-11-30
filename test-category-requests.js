const axios = require('axios');

// Test the category requests API
async function testCategoryRequests() {
  try {
    console.log('Testing category requests API...');
    
    // Make a request without authentication (should fail)
    const response = await axios.get('http://localhost:5000/api/category-requests');
    console.log('Success! Response:', response.data);
  } catch (error) {
    console.log('Error status:', error.response?.status);
    console.log('Error data:', error.response?.data);
    console.log('Error message:', error.message);
  } finally {
    console.log('Test completed.');
  }
}

testCategoryRequests().then(() => {
  console.log('Script finished.');
});