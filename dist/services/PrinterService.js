"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrinterService = void 0;
const node_thermal_printer_1 = require("node-thermal-printer");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class PrinterService {
    constructor() {
        this.isRealPrinter = true; // Set to true to use real printer
        // For fallback/testing - output to a file
        this.receiptFilePath = path.join(process.cwd(), 'receipt.txt');
        if (this.isRealPrinter) {
            // REAL PRINTER CONFIGURATION
            // Uncomment and configure ONE of the following connection types:
            // 1. USB PRINTER (most common for receipt printers)
            this.printer = new node_thermal_printer_1.ThermalPrinter({
                type: node_thermal_printer_1.PrinterTypes.EPSON, // Change to your printer type: EPSON, STAR, TANCA, etc.
                interface: 'printer:auto', // For automatic selection, or specify exact path
                // interface: 'usb://Vendor/Printer', // Example: usb://EPSON/TM-T20III
                options: {
                    timeout: 5000
                }
            });
            // 2. NETWORK PRINTER
            /*
            this.printer = new ThermalPrinter({
              type: PrinterTypes.EPSON, // Change to your printer type
              interface: 'tcp://192.168.1.100:9100', // Replace with your printer's IP and port
              options: {
                timeout: 5000
              }
            });
            */
            // 3. SERIAL PORT PRINTER
            /*
            this.printer = new ThermalPrinter({
              type: PrinterTypes.EPSON, // Change to your printer type
              interface: '/dev/tty.usbserial', // Replace with your serial port
              options: {
                baudRate: 9600,
                timeout: 5000
              }
            });
            */
        }
        else {
            // MOCK PRINTER (writes to file)
            this.printer = new node_thermal_printer_1.ThermalPrinter({
                type: node_thermal_printer_1.PrinterTypes.EPSON,
                interface: 'printer',
                options: {
                    timeout: 5000
                },
                driver: {
                    // Mock driver that logs commands to a file
                    write: (buffer) => __awaiter(this, void 0, void 0, function* () {
                        // First clear the file
                        if (!fs.existsSync(this.receiptFilePath)) {
                            yield fs.promises.writeFile(this.receiptFilePath, '', { flag: 'w' });
                        }
                        // Append text data
                        const textData = buffer.toString().replace(/\x1B\x21\x00/g, '\n').replace(/\x1B\x21\x01/g, '\n*** BOLD ***\n');
                        yield fs.promises.appendFile(this.receiptFilePath, textData, { flag: 'a' });
                        console.log('Written to receipt file:', textData);
                        return true;
                    }),
                    open: () => __awaiter(this, void 0, void 0, function* () {
                        // Start with a clean receipt file
                        yield fs.promises.writeFile(this.receiptFilePath, '=== RECEIPT START ===\n\n', { flag: 'w' });
                        return true;
                    }),
                    close: () => __awaiter(this, void 0, void 0, function* () {
                        // Add a clear end marker
                        yield fs.promises.appendFile(this.receiptFilePath, '\n\n=== RECEIPT END ===', { flag: 'a' });
                        return true;
                    })
                }
            });
        }
    }
    isPrinterConnected() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // For file-based output, we just check if we can write to the file
                const testWrite = yield fs.promises.writeFile(this.receiptFilePath, '', { flag: 'w' }).then(() => true).catch(() => false);
                console.log('Printer (file) connected:', testWrite);
                return testWrite;
            }
            catch (error) {
                console.error('Error checking printer connection:', error);
                return false;
            }
        });
    }
    getDetailedPrinterStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const isConnected = yield this.isPrinterConnected();
                if (!isConnected) {
                    return {
                        connected: false,
                        message: 'Printer is not connected',
                        errorDetails: 'Connection test failed'
                    };
                }
                // For real printers, try to get more detailed status
                if (this.isRealPrinter) {
                    try {
                        // In a real implementation, you might get more detailed status
                        // like paper levels, errors, etc. depending on your printer model
                        return {
                            connected: true,
                            message: 'Printer is connected and ready',
                            printerInfo: {
                                type: this.printer.constructor.name,
                                config: this.isRealPrinter ? 'Hardware printer' : 'Mock printer'
                            }
                        };
                    }
                    catch (error) {
                        console.error('Error getting detailed printer status:', error);
                        return {
                            connected: true,
                            message: 'Printer is connected but status check failed',
                            error: error instanceof Error ? error.message : String(error)
                        };
                    }
                }
                // For mock printers
                return {
                    connected: true,
                    message: 'Mock printer is ready',
                    isMock: true,
                    outputFile: this.receiptFilePath
                };
            }
            catch (error) {
                console.error('Error checking detailed printer status:', error);
                return {
                    connected: false,
                    message: 'Error checking printer status',
                    error: error instanceof Error ? error.message : String(error)
                };
            }
        });
    }
    printOrder(order) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('Starting to print order for table:', order.table);
                if (!(yield this.isPrinterConnected())) {
                    throw new Error('Printer not connected');
                }
                // Create direct output to console for debugging
                console.log('====== RECEIPT PREVIEW ======');
                console.log('ORDER RECEIPT');
                console.log(`Table: ${order.table}`);
                console.log('--------------------------');
                console.log('ITEMS:');
                order.items.forEach(item => {
                    console.log(`${item.quantity}x ${item.name} - $${item.price.toFixed(2)}`);
                });
                console.log('--------------------------');
                console.log(`TOTAL: $${order.total.toFixed(2)}`);
                console.log('Thank you for your order!');
                console.log('====== END OF RECEIPT ======');
                // Reset printer
                yield this.printer.clear();
                // Print header
                this.printer.alignCenter();
                this.printer.bold(true);
                this.printer.println('ORDER RECEIPT');
                this.printer.bold(false);
                this.printer.newLine();
                // Print table number
                this.printer.alignLeft();
                this.printer.println(`Table: ${order.table}`);
                this.printer.drawLine();
                // Print items
                this.printer.alignLeft();
                this.printer.println('ITEMS');
                order.items.forEach(item => {
                    this.printer.println(`${item.quantity}x ${item.name}`);
                    this.printer.alignRight();
                    this.printer.println(`$${item.price.toFixed(2)}`);
                    this.printer.alignLeft();
                });
                // Print total
                this.printer.drawLine();
                this.printer.alignRight();
                this.printer.bold(true);
                this.printer.println(`TOTAL: $${order.total.toFixed(2)}`);
                this.printer.bold(false);
                // Print footer
                this.printer.alignCenter();
                this.printer.newLine();
                this.printer.println('Thank you for your order!');
                this.printer.cut();
                // Execute print job
                yield this.printer.execute();
                console.log('Print job completed successfully');
                return true;
            }
            catch (error) {
                console.error('Error printing order:', error);
                return false;
            }
        });
    }
}
exports.PrinterService = PrinterService;
