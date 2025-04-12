import fetch from 'node-fetch';

// Example order data
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

// Define response type
interface PrinterStatusResponse {
  success: boolean;
  connected: boolean;
  message: string;
}

async function testPrintAPI() {
  try {
    // Check printer status first
    console.log('Checking printer status...');
    const statusResponse = await fetch('http://localhost:3000/api/status');
    const statusData = await statusResponse.json() as PrinterStatusResponse;
    console.log('Printer status:', statusData);

    if (statusData.connected) {
      // If printer is connected, send the print request
      console.log('Sending print request...');
      const printResponse = await fetch('http://localhost:3000/api/print', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      const printResult = await printResponse.json();
      console.log('Print result:', printResult);
    } else {
      console.log('No printer connected. Please connect a printer and try again.');
    }
  } catch (error) {
    console.error('Error testing print API:', error);
  }
}

// Run the test
testPrintAPI(); 