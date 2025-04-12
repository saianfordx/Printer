import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Our test order data
const orderData = {
  table: "M1",
  total: 175,
  items: [
    {
      name: "taco de pastorabcdwefghijklmnop",
      price: 150,
      quantity: 1
    },
    {
      name: "agua mineral",
      price: 25,
      quantity: 1
    }
  ]
};

// Create a receipt file manually for testing
async function createTestReceipt() {
  const receiptPath = path.join(process.cwd(), 'test-receipt.txt');
  
  let content = '===== ORDER RECEIPT =====\n\n';
  content += `Table: ${orderData.table}\n`;
  content += '-------------------------\n';
  content += 'ITEMS:\n';
  
  for (const item of orderData.items) {
    content += `${item.quantity}x ${item.name} - $${item.price.toFixed(2)}\n`;
  }
  
  content += '-------------------------\n';
  content += `TOTAL: $${orderData.total.toFixed(2)}\n\n`;
  content += 'Thank you for your order!\n';
  content += '=========================';
  
  await fs.promises.writeFile(receiptPath, content);
  console.log(`Test receipt created at: ${receiptPath}`);
  return receiptPath;
}

// Test the API
async function testAPI() {
  try {
    // First create a test receipt
    await createTestReceipt();
    
    // Now test the API
    console.log('Sending test order to API...');
    const response = await axios.post('http://localhost:3001/api/print', orderData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('API Response:', response.data);
    
    // Also check the status endpoint
    console.log('Checking printer status...');
    const statusResponse = await axios.get('http://localhost:3001/api/status');
    console.log('Status Response:', statusResponse.data);
    
    return response.data;
  } catch (error) {
    console.error('Error testing API:', error);
    throw error;
  }
}

// Run the test
testAPI()
  .then(() => console.log('Test completed successfully'))
  .catch(err => console.error('Test failed:', err)); 