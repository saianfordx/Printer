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
const node_fetch_1 = __importDefault(require("node-fetch"));
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
function testPrintAPI() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Check printer status first
            console.log('Checking printer status...');
            const statusResponse = yield (0, node_fetch_1.default)('http://localhost:3000/api/status');
            const statusData = yield statusResponse.json();
            console.log('Printer status:', statusData);
            if (statusData.connected) {
                // If printer is connected, send the print request
                console.log('Sending print request...');
                const printResponse = yield (0, node_fetch_1.default)('http://localhost:3000/api/print', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(orderData),
                });
                const printResult = yield printResponse.json();
                console.log('Print result:', printResult);
            }
            else {
                console.log('No printer connected. Please connect a printer and try again.');
            }
        }
        catch (error) {
            console.error('Error testing print API:', error);
        }
    });
}
// Run the test
testPrintAPI();
