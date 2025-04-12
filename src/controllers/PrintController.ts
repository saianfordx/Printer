import { Request, Response } from 'express';
import { Order } from '../interfaces/Order';
import { PrinterService } from '../services/PrinterService';

export class PrintController {
  private printerService: PrinterService;

  constructor() {
    this.printerService = new PrinterService();
  }

  async printOrder(req: Request, res: Response): Promise<void> {
    try {
      const orderData: Order = req.body;
      
      // Validate request body
      if (!orderData.table || !orderData.total || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        res.status(400).json({ success: false, message: 'Invalid order data' });
        return;
      }

      // Print the order
      const success = await this.printerService.printOrder(orderData);
      
      if (success) {
        res.status(200).json({ success: true, message: 'Order printed successfully' });
      } else {
        res.status(500).json({ success: false, message: 'Failed to print order' });
      }
    } catch (error) {
      console.error('Error in print controller:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async checkPrinterStatus(req: Request, res: Response): Promise<void> {
    try {
      const isConnected = await this.printerService.isPrinterConnected();
      
      if (isConnected) {
        res.status(200).json({ success: true, connected: true, message: 'Printer is connected' });
      } else {
        res.status(200).json({ success: true, connected: false, message: 'Printer is not connected' });
      }
    } catch (error) {
      console.error('Error checking printer status:', error);
      res.status(500).json({ success: false, message: 'Error checking printer status' });
    }
  }

  async getDetailedPrinterStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = await this.printerService.getDetailedPrinterStatus();
      res.status(200).json({ 
        success: true, 
        ...status
      });
    } catch (error) {
      console.error('Error getting detailed printer status:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error getting detailed printer status',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
} 