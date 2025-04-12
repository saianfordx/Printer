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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrintController = void 0;
const PrinterService_1 = require("../services/PrinterService");
class PrintController {
    constructor() {
        this.printerService = new PrinterService_1.PrinterService();
    }
    printOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const orderData = req.body;
                // Validate request body
                if (!orderData.table || !orderData.total || !Array.isArray(orderData.items) || orderData.items.length === 0) {
                    res.status(400).json({ success: false, message: 'Invalid order data' });
                    return;
                }
                // Print the order
                const success = yield this.printerService.printOrder(orderData);
                if (success) {
                    res.status(200).json({ success: true, message: 'Order printed successfully' });
                }
                else {
                    res.status(500).json({ success: false, message: 'Failed to print order' });
                }
            }
            catch (error) {
                console.error('Error in print controller:', error);
                res.status(500).json({ success: false, message: 'Internal server error' });
            }
        });
    }
    checkPrinterStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const isConnected = yield this.printerService.isPrinterConnected();
                if (isConnected) {
                    res.status(200).json({ success: true, connected: true, message: 'Printer is connected' });
                }
                else {
                    res.status(200).json({ success: true, connected: false, message: 'Printer is not connected' });
                }
            }
            catch (error) {
                console.error('Error checking printer status:', error);
                res.status(500).json({ success: false, message: 'Error checking printer status' });
            }
        });
    }
    getDetailedPrinterStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const status = yield this.printerService.getDetailedPrinterStatus();
                res.status(200).json(Object.assign({ success: true }, status));
            }
            catch (error) {
                console.error('Error getting detailed printer status:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error getting detailed printer status',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        });
    }
}
exports.PrintController = PrintController;
