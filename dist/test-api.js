"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
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
function createTestReceipt() {
    return __awaiter(this, void 0, void 0, function* () {
        const receiptPath = path_1.default.join(process.cwd(), 'test-receipt.txt');
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
        yield fs_1.default.promises.writeFile(receiptPath, content);
        console.log(`Test receipt created at: ${receiptPath}`);
        return receiptPath;
    });
}
// Test the API
function testAPI() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // First create a test receipt
            yield createTestReceipt();
            // Now test the API
            console.log('Sending test order to API...');
            const response = yield axios_1.default.post('http://localhost:3001/api/print', orderData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            console.log('API Response:', response.data);
            // Also check the status endpoint
            console.log('Checking printer status...');
            const statusResponse = yield axios_1.default.get('http://localhost:3001/api/status');
            console.log('Status Response:', statusResponse.data);
            return response.data;
        }
        catch (error) {
            console.error('Error testing API:', error);
            throw error;
        }
    });
}
// Run the test
testAPI()
    .then(() => console.log('Test completed successfully'))
    .catch(err => console.error('Test failed:', err));
