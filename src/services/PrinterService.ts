import { ThermalPrinter, PrinterTypes } from 'node-thermal-printer';
import * as fs from 'fs';
import * as path from 'path';
import { Order } from '../interfaces/Order';
import { exec } from 'child_process';
import { promisify } from 'util';

export class PrinterService {
  private printer!: ThermalPrinter; // Use definite assignment assertion
  private receiptFilePath: string;
  private printerFound: boolean = false;
  private printerList: string[] = [];

  constructor() {
    // Path for receipt file is still useful for logging
    this.receiptFilePath = path.join(process.cwd(), 'receipt.txt');
    
    // Immediately scan for printers on initialization
    this.scanForPrinters().then(printers => {
      if (printers.length > 0) {
        console.log(`Successfully initialized with printer: ${printers[0]}`);
      } else {
        console.log('No printers found during initialization');
      }
    });
  }

  private initializeRealPrinter(printerPath: string) {
    try {
      console.log(`Attempting to initialize printer with path: ${printerPath}`);
      
      // REAL PRINTER CONFIGURATION
      this.printer = new ThermalPrinter({
        type: PrinterTypes.EPSON, // Using EPSON as a common thermal printer type
        interface: printerPath,  // The printer path from CUPS
        options: {
          timeout: 5000
        }
      });
      
      console.log('Printer object created successfully');
      this.printerFound = true;
    } catch (error) {
      console.error('Error initializing printer:', error);
      this.printerFound = false;
    }
  }

  async scanForPrinters(): Promise<string[]> {
    try {
      const execPromise = promisify(exec);
      
      let detectedPrinters: string[] = [];
      
      // Detect the OS to use appropriate command
      const platform = process.platform;
      
      if (platform === 'darwin') { // macOS
        // Get printer list using lpstat which is more reliable on macOS
        const { stdout } = await execPromise('lpstat -p | grep -v "disabled"');
        console.log('Raw lpstat output:', stdout); // Debug log
        
        // Extract printer names from lpstat output
        detectedPrinters = stdout
          .split('\n')
          .filter(line => line.trim() !== '')
          .map(line => {
            // The pattern for macOS is typically "printer PRINTER_NAME is idle."
            const match = line.match(/printer ([^\s]+)/);
            return match ? match[1] : '';
          })
          .filter(printer => printer !== '');
      } else if (platform === 'linux') { // Linux
        const { stdout } = await execPromise('lpstat -a');
        detectedPrinters = stdout
          .split('\n')
          .filter(line => line.trim() !== '')
          .map(line => line.split(' ')[0])
          .filter(printer => printer !== '');
      } else if (platform === 'win32') { // Windows
        const { stdout } = await execPromise('wmic printer get name');
        detectedPrinters = stdout
          .split('\n')
          .slice(1) // Skip header
          .filter(line => line.trim() !== '')
          .map(line => line.trim());
      }
      
      // Log whether printers were detected
      if (detectedPrinters.length > 0) {
        console.log('\n========== PRINTER DETECTION ==========');
        console.log(`✅ PRINTERS DETECTED: ${detectedPrinters.length}`);
        console.log('---------------------------------------');
        detectedPrinters.forEach((printer, index) => {
          console.log(`Printer ${index + 1}: ${printer}`);
        });
        console.log('=======================================\n');
        
        // Initialize the printer using correct configuration
        try {
          // For macOS and other platforms, use the correct printer name and configuration
          this.printer = new ThermalPrinter({
            type: PrinterTypes.EPSON,
            interface: platform === 'darwin' ? detectedPrinters[0] : `printer:${detectedPrinters[0]}`,
            options: {
              timeout: 8000
            }
          });
          
          this.printerFound = true;
          console.log(`Successfully initialized printer: ${detectedPrinters[0]}`);
        } catch (error) {
          console.error('Error during printer initialization:', error);
          this.printerFound = false;
        }
      } else {
        console.log('\n========== PRINTER DETECTION ==========');
        console.log('❌ NO PRINTERS DETECTED');
        console.log('=======================================\n');
        
        this.printerFound = false;
      }
      
      this.printerList = detectedPrinters;
      return detectedPrinters;
    } catch (error) {
      console.error('Error scanning for printers:', error);
      
      this.printerFound = false;
      
      console.log('\n========== PRINTER DETECTION ==========');
      console.log('❌ ERROR DETECTING PRINTERS');
      console.log('=======================================\n');
      
      return [];
    }
  }

  async isPrinterConnected(): Promise<boolean> {
    return this.printerFound;
  }

  async getDetailedPrinterStatus(): Promise<any> {
    try {
      const isConnected = await this.isPrinterConnected();
      
      if (!isConnected) {
        return {
          connected: false,
          message: 'Printer is not connected',
          errorDetails: 'No printer detected'
        };
      }
      
      try {
        const printerInfo = {
          type: this.printer.constructor.name,
          config: 'Hardware printer',
          name: this.printerList.length > 0 ? this.printerList[0] : 'Unknown',
          platform: process.platform
        };
        
        // Log printer information
        console.log('\n========== PRINTER INFORMATION ==========');
        console.log(`Printer Name: ${printerInfo.name}`);
        console.log(`Printer Type: ${printerInfo.type}`);
        console.log(`Configuration: ${printerInfo.config}`);
        console.log(`Platform: ${printerInfo.platform}`);
        console.log('==========================================\n');
        
        return {
          connected: true,
          message: 'Printer is connected and ready',
          printerInfo
        };
      } catch (error) {
        console.error('Error getting detailed printer status:', error);
        return {
          connected: false,
          message: 'Printer status check failed',
          error: error instanceof Error ? error.message : String(error)
        };
      }
    } catch (error) {
      console.error('Error checking detailed printer status:', error);
      return {
        connected: false,
        message: 'Error checking printer status',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  async printOrder(order: Order): Promise<boolean> {
    try {
      console.log('\n========== PRINTING ORDER ==========');
      console.log(`Table: ${order.table}`);
      console.log('------------------------------------');
      
      // Format the receipt content in a structured, professionally formatted way
      const receiptContent = this.formatReceipt(order);

      // Print preview to console
      console.log('------- RECEIPT CONTENT -------');
      console.log(receiptContent);
      console.log('------------------------------');

      // Define thermal printer control codes for proper text formatting
      // Initialize printer
      const ESC = '\x1B';
      const INITIALIZE = `${ESC}@`;
      // Set text justification to left
      const JUSTIFY_LEFT = `${ESC}a0`;
      // Line feed and cut paper after printing
      const CUT_PAPER = `${ESC}m`;
      
      // Create properly formatted content with control codes
      const thermalContent = `${INITIALIZE}${JUSTIFY_LEFT}${receiptContent}\n\n\n\n${CUT_PAPER}`;

      // Write to file
      await fs.writeFileSync(this.receiptFilePath, thermalContent);
      
      // Use system command to print with raw option
      const execPromise = promisify(exec);
      
      // For macOS, use the correct raw printing command
      if (process.platform === 'darwin') {
        // On macOS, use lp with raw option to ensure control codes are preserved
        await execPromise(`lp -d ${this.printerList[0]} -o raw ${this.receiptFilePath}`);
      } else {
        // For other platforms, use lpr
        await execPromise(`lpr -P ${this.printerList[0]} -o raw ${this.receiptFilePath}`);
      }
      
      console.log('✅ PRINT JOB SENT');
      
      return true;
    } catch (error) {
      console.error('Error printing order:', error);
      console.log('❌ PRINT JOB FAILED');
      return false;
    }
  }

  private formatReceipt(order: Order): string {
    // Get current date and time
    const now = new Date();
    const date = now.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '/');
    const time = now.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    // Generate random UUID for folio number
    const folioNumber = this.generateUUID();

    // Create divider line
    const divider = '---------------------------------------';

    // Create header for items table
    const header = 'Cant    Producto                P. Unit    Total';

    // Format each item with proper spacing and alignment
    const formattedItems = order.items.map(item => {
      const quantity = Math.floor(item.quantity).toString().padEnd(8);
      const name = item.name.padEnd(24).substring(0, 24); // Limit to 24 chars
      const unitPrice = `${item.price.toFixed(2)}`.padStart(9);
      const total = `${(item.quantity * item.price).toFixed(2)}`.padStart(10);
      
      return `${quantity}${name}${unitPrice}${total}`;
    }).join('\n');

    // Format the total section
    const totalSection = [
      divider,
      `${'Total:'.padEnd(33)}${(order.total).toFixed(2)}`
    ].join('\n');

    // Format thank you message
    const thankYouSection = [
      `\nGracias por su preferencia!`
    ].join('\n');

    // Updated restaurant information
    const restaurantInfo = [
      'TEMPLO RAMURI',
      'HYGGELISH SPACES',
      'RFC: HSP231229S13',
      'Avenida Melchor Ocampo 2013 Zona Centro, Tijuana, BC',
      'CP 22000',
      'Tel: (663) 123-5595',
      `FECHA: ${date}    HORA: ${time}`,
      `Número de folio: ${folioNumber}`,
      `MESA: ${order.table}         MESERO: Carlos`
    ].join('\n');

    // Add pre-padding to ensure no content is lost (more padding)
    const padding = '\n\n\n\n\n\n\n';
    
    // Build the receipt with the sections in the correct order
    return [
      padding,                // Extra space at beginning to prevent cutting off 
      restaurantInfo,         // Full restaurant info including name and address
      divider,
      header,
      divider,
      formattedItems,         // Items
      totalSection,           // Totals
      thankYouSection         // Thank you message
    ].join('\n');
  }
  
  // Helper to generate UUID for folio
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    }).substring(0, 8).toUpperCase(); // Using first 8 chars for brevity
  }
  
  async sendToPrinter(payload: any): Promise<{success: boolean, message: string}> {
    console.log('\n========== PRINTER PROCESS STARTED ==========');
    
    // Scan for available printers first
    const printers = await this.scanForPrinters();
    
    if (printers.length === 0) {
      console.log('❌ NO PRINTERS DETECTED - CANNOT PRINT');
      console.log('=========================================\n');
      
      return {
        success: false,
        message: "no printers detected"
      };
    }
    
    // Get and display detailed printer information
    const printerInfo = await this.getDetailedPrinterStatus();
    
    if (!this.printerFound) {
      return {
        success: false,
        message: "Printer not available"
      };
    }
    
    // If payload is an Order, use the printOrder method ONLY
    if (payload && typeof payload === 'object' && 'table' in payload && 'items' in payload) {
      const success = await this.printOrder(payload as Order);
      
      if (!success) {
        return {
          success: false,
          message: "Failed to print order"
        };
      }
      
      return {
        success: true,
        message: "Order printed successfully"
      };
    } else {
      // For non-Order payloads, format and print as needed
      try {
        console.log('\n========== PRINTING CUSTOM PAYLOAD ==========');
        
        // For non-Order data, use a simple formatting approach
        // const payloadStr = typeof payload === 'string' 
        //   ? payload 
        //   : `Payload data: ${JSON.stringify(payload, null, 2)}`;
          
        // Write to file
        //fs.writeFileSync(this.receiptFilePath, payloadStr);
        
        // Use system command to print with raw option
        // const execPromise = promisify(exec);
        // await execPromise(`lpr -P ${this.printerList[0]} -o raw ${this.receiptFilePath}`);
        
        console.log('✅ PAYLOAD PRINTED SUCCESSFULLY');
        console.log('==========================================\n');
        
        return {
          success: true,
          message: "Payload printed successfully"
        };
      } catch (error) {
        console.error('Error printing payload:', error);
        
        console.log('❌ PAYLOAD PRINT FAILED');
        console.log('==========================================\n');
        
        return {
          success: false,
          message: "Failed to print payload: " + (error instanceof Error ? error.message : String(error))
        };
      }
    }
  }
} 