
import { PrinterConfig } from "@/types/printerTypes";

// Check if Web Bluetooth API is available
export const isBluetooth5Available = (): boolean => {
  return navigator.bluetooth !== undefined;
};

// Connect to a Bluetooth printer
export async function connectBluetoothPrinter(printer: PrinterConfig): Promise<BluetoothDevice | null> {
  if (!isBluetooth5Available()) {
    console.error("Web Bluetooth API is not available in this browser");
    return null;
  }

  try {
    // Request device with print service UUID
    // Standard service for printers, but might vary depending on your printer model
    const device = await navigator.bluetooth.requestDevice({
      filters: [
        { services: ['000018f0-0000-1000-8000-00805f9b34fb'] }, // Generic printer service
        { namePrefix: printer.name }
      ],
      optionalServices: ['battery_service']
    });

    console.log(`Bluetooth device selected: ${device.name}`);
    
    // Connect to the device
    const server = await device.gatt?.connect();
    if (!server) {
      throw new Error("Failed to connect to GATT server");
    }
    
    console.log("Connected to GATT server");
    
    // For future communications, you would save this device
    // We'll return the device for now
    return device;
  } catch (error) {
    console.error("Bluetooth connection error:", error);
    return null;
  }
}

// Send data to a Bluetooth printer
export async function printToBluetoothPrinter(
  content: string, 
  printer: PrinterConfig
): Promise<boolean> {
  try {
    // Validate required printer properties
    if (!printer.name || !printer.bluetoothId) {
      console.error("Printer name and bluetoothId are required for Bluetooth printing");
      return false;
    }
    
    // Connect to the device
    const device = await connectBluetoothPrinter(printer);
    if (!device) {
      throw new Error("Failed to connect to printer");
    }
    
    const server = await device.gatt?.connect();
    if (!server) {
      throw new Error("Failed to connect to GATT server");
    }
    
    // Get primary service for printing
    // This UUID might need to be adjusted based on your printer model
    const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
    
    // Get characteristic for writing print data
    // Again, this UUID might need to be adjusted
    const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');
    
    // Convert content to printer format
    // This will vary based on printer model - ESC/POS commands are common
    const encoder = new TextEncoder();
    const data = encoder.encode(formatForPrinter(content));
    
    // Send data to the printer
    await characteristic.writeValue(data);
    
    console.log("Data sent to Bluetooth printer successfully");
    return true;
  } catch (error) {
    console.error("Error printing to Bluetooth device:", error);
    return false;
  }
}

// Format content for printer using ESC/POS commands
function formatForPrinter(content: string): string {
  // ESC/POS commands for common operations
  const ESC = '\x1B';
  const LF = '\x0A';
  
  // Initialize printer
  let formattedContent = `${ESC}@`;
  
  // Set text alignment to center for header
  formattedContent += `${ESC}a1`;
  
  // Add content (with proper line breaks)
  formattedContent += content.replace(/\n/g, LF);
  
  // Cut paper (if supported)
  formattedContent += `${ESC}d0${ESC}m`;
  
  return formattedContent;
}

// Send data to a network printer
export async function printToNetworkPrinter(
  content: string, 
  printer: PrinterConfig
): Promise<boolean> {
  if (!printer.ipAddress) {
    console.error("IP address is required for network printing");
    return false;
  }
  
  try {
    // In a real application, you would use a network protocol like IPP or RAW
    // For browser-based applications, you'd likely use a proxy service or backend
    console.log(`Sending print job to network printer at ${printer.ipAddress}`);
    
    // Simulate network request to printer
    const response = await fetch(`http://${printer.ipAddress}/print`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: formatForPrinter(content),
    });
    
    if (!response.ok) {
      throw new Error(`Network printer responded with ${response.status}`);
    }
    
    console.log("Data sent to network printer successfully");
    return true;
  } catch (error) {
    console.error("Error printing to network device:", error);
    return false;
  }
}

// Detect available Bluetooth printers
export async function scanForBluetoothPrinters(): Promise<BluetoothDevice[]> {
  if (!isBluetooth5Available()) {
    console.error("Web Bluetooth API is not available in this browser");
    return [];
  }
  
  try {
    // Request any device that looks like a printer
    const device = await navigator.bluetooth.requestDevice({
      filters: [
        { services: ['000018f0-0000-1000-8000-00805f9b34fb'] }, // Generic printer service
        { namePrefix: 'Printer' },
        { namePrefix: 'POS' },
        { namePrefix: 'ESC' }
      ],
      optionalServices: ['battery_service']
    });
    
    console.log(`Bluetooth device found: ${device.name}`);
    return [device];
  } catch (error) {
    console.error("Error scanning for Bluetooth printers:", error);
    return [];
  }
}
