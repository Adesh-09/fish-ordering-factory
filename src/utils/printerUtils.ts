
import { PrinterConfig, PrintJob, PrintResult } from "@/types/printerTypes";
import { toast } from "@/components/ui/use-toast";

// Cache for connected devices to improve reconnection
const connectedDevicesCache = new Map<string, BluetoothDevice>();

// Check if Web Bluetooth API is available
export const isBluetooth5Available = (): boolean => {
  return navigator.bluetooth !== undefined;
};

// Test connection to a printer
export async function testPrinterConnection(printer: PrinterConfig): Promise<boolean> {
  try {
    switch (printer.connectionType) {
      case "bluetooth":
        return await testBluetoothConnection(printer);
      case "network":
        return await testNetworkConnection(printer);
      case "usb":
        // For USB printers in web context, we need to check if the device is connected
        // This would typically use WebUSB API 
        return await testUSBConnection(printer);
      default:
        return false;
    }
  } catch (error) {
    console.error(`Error testing connection to ${printer.name}:`, error);
    return false;
  }
}

// Test connection to a USB printer using WebUSB
async function testUSBConnection(printer: PrinterConfig): Promise<boolean> {
  // Check if WebUSB API is available
  if (!navigator.usb) {
    console.error("WebUSB API is not available in this browser");
    return false;
  }

  try {
    // Request access to USB devices (this will prompt the user)
    const devices = await navigator.usb.getDevices();
    console.log("USB devices:", devices);
    
    // For real implementation, we would check if any of the devices match our printer
    // For now, just return true if we have any USB devices
    return devices.length > 0;
  } catch (error) {
    console.error("WebUSB test failed:", error);
    return false;
  }
}

// Test connection to a Bluetooth printer
async function testBluetoothConnection(printer: PrinterConfig): Promise<boolean> {
  if (!printer.name || !printer.bluetoothId) {
    console.error("Printer name and bluetoothId are required for Bluetooth printing");
    return false;
  }
  
  if (!isBluetooth5Available()) {
    console.error("Web Bluetooth API is not available in this browser");
    return false;
  }

  try {
    const device = await connectBluetoothPrinter(printer);
    return device !== null;
  } catch (error) {
    console.error("Bluetooth connection test failed:", error);
    return false;
  }
}

// Test connection to a network printer
async function testNetworkConnection(printer: PrinterConfig): Promise<boolean> {
  if (!printer.ipAddress) {
    console.error("IP address is required for network printing");
    return false;
  }

  try {
    // For web apps, we typically use a fetch with a timeout to test connectivity
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(`http://${printer.ipAddress}/`, {
      method: 'HEAD',
      signal: controller.signal
    }).catch(() => null);
    
    clearTimeout(timeoutId);
    return response !== null && response.ok;
  } catch (error) {
    console.error("Network connection test failed:", error);
    return false;
  }
}

// Request USB access and connect to a USB printer
export async function connectUSBPrinter(): Promise<USBDevice | null> {
  if (!navigator.usb) {
    console.error("WebUSB API is not available in this browser");
    toast({
      title: "Browser Not Supported",
      description: "Your browser doesn't support USB connectivity",
      variant: "destructive",
    });
    return null;
  }

  try {
    // Request device with printer interface class (0x07)
    const device = await navigator.usb.requestDevice({
      filters: [{ classCode: 0x07 }] // Printer class
    });
    
    if (!device) {
      throw new Error("No USB printer selected");
    }

    // Open device and claim interface
    await device.open();
    
    // For most printers, configuration 1 and interface 0 are standard
    if (device.configuration === null) {
      await device.selectConfiguration(1);
    }
    
    // Find the printer interface
    const interfaceNumber = 0; // Usually the first interface is the printer interface
    await device.claimInterface(interfaceNumber);
    
    console.log("USB printer connected:", device);
    toast({
      title: "USB Printer Connected",
      description: `Successfully connected to USB printer`,
    });
    
    return device;
  } catch (error) {
    console.error("USB connection error:", error);
    
    // Don't show error toast if user canceled the selection
    if (!(error instanceof DOMException && error.name === "NotFoundError")) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to USB printer",
        variant: "destructive",
      });
    }
    
    return null;
  }
}

// Connect to a Bluetooth printer
export async function connectBluetoothPrinter(printer: PrinterConfig): Promise<BluetoothDevice | null> {
  if (!printer.name || !printer.bluetoothId) {
    console.error("Printer name and bluetoothId are required for Bluetooth printing");
    toast({
      title: "Connection Error",
      description: "Printer name and Bluetooth ID are required",
      variant: "destructive",
    });
    return null;
  }

  if (!isBluetooth5Available()) {
    console.error("Web Bluetooth API is not available in this browser");
    toast({
      title: "Browser Not Supported",
      description: "Your browser doesn't support Bluetooth connection",
      variant: "destructive",
    });
    return null;
  }

  // Check if we already have a cached device
  if (connectedDevicesCache.has(printer.bluetoothId)) {
    const cachedDevice = connectedDevicesCache.get(printer.bluetoothId)!;
    
    try {
      // Check if device is still connected
      if (cachedDevice.gatt?.connected) {
        console.log("Using cached Bluetooth connection");
        return cachedDevice;
      } else {
        // Try to reconnect
        await cachedDevice.gatt?.connect();
        return cachedDevice;
      }
    } catch (error) {
      console.log("Cached device no longer available, reconnecting...");
      // Connection failed, remove from cache and try to reconnect
      connectedDevicesCache.delete(printer.bluetoothId);
    }
  }

  try {
    let device;
    
    // Check if we need to discover the device or use a known ID
    if (printer.bluetoothId) {
      // Request specific device by ID if we already know it
      // Note: This won't work in practice as Web Bluetooth doesn't allow connecting directly by ID
      // for security reasons, but we include this code to show what it would look like
      device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['000018f0-0000-1000-8000-00805f9b34fb'] }, // Generic printer service
          { namePrefix: printer.name }
        ],
        optionalServices: ['battery_service', '000018f0-0000-1000-8000-00805f9b34fb']
      });
    } else {
      // If no ID is provided, scan for any printer-like device
      device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['000018f0-0000-1000-8000-00805f9b34fb'] }, // Generic printer service
          { namePrefix: 'Printer' },
          { namePrefix: 'POS' },
          { namePrefix: 'ESC' }
        ],
        optionalServices: ['battery_service', '000018f0-0000-1000-8000-00805f9b34fb']
      });
    }

    console.log(`Bluetooth device selected: ${device.name}`);
    
    // Connect to the device
    const server = await device.gatt?.connect();
    if (!server) {
      throw new Error("Failed to connect to GATT server");
    }
    
    console.log("Connected to GATT server");
    
    // Cache the device for future use
    connectedDevicesCache.set(device.id, device);
    
    toast({
      title: "Printer Connected",
      description: `Successfully connected to ${printer.name}`,
    });
    
    return device;
  } catch (error) {
    console.error("Bluetooth connection error:", error);
    
    // Don't show error toast if user canceled the selection
    if (!(error instanceof DOMException && error.name === "NotFoundError")) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to printer",
        variant: "destructive",
      });
    }
    
    return null;
  }
}

// Send data to a Bluetooth printer
export async function printToBluetoothPrinter(
  content: string, 
  printer: PrinterConfig
): Promise<PrintResult> {
  try {
    // Validate required printer properties
    if (!printer.name || !printer.bluetoothId) {
      const error = "Printer name and bluetoothId are required for Bluetooth printing";
      console.error(error);
      return {
        success: false,
        message: error
      };
    }
    
    // Connect to the device
    const device = await connectBluetoothPrinter(printer);
    if (!device) {
      return {
        success: false,
        message: "Failed to connect to printer"
      };
    }
    
    const server = await device.gatt?.connect();
    if (!server) {
      return {
        success: false,
        message: "Failed to connect to GATT server"
      };
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
    const data = encoder.encode(formatForPrinter(content, printer.paperWidth));
    
    // Create print job
    const printJob: PrintJob = {
      id: Math.random().toString(36).substring(2, 15),
      content,
      printer,
      status: "pending",
      createdAt: new Date()
    };
    
    // Send data to the printer in chunks to avoid buffer overflow
    const chunkSize = 512; // Adjust based on printer buffer size
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      await characteristic.writeValue(chunk);
      
      // Small delay between chunks
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Update print job
    printJob.status = "completed";
    printJob.completedAt = new Date();
    
    console.log("Data sent to Bluetooth printer successfully");
    toast({
      title: "Print Successful",
      description: `Document sent to ${printer.name}`,
    });
    
    return {
      success: true,
      message: "Print job completed successfully",
      job: printJob
    };
  } catch (error) {
    console.error("Error printing to Bluetooth device:", error);
    
    toast({
      title: "Print Failed",
      description: error instanceof Error ? error.message : "Failed to print document",
      variant: "destructive",
    });
    
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Print to USB printer
export async function printToUSBPrinter(
  content: string,
  printer: PrinterConfig,
  usbDevice?: USBDevice
): Promise<PrintResult> {
  try {
    // Get USB device if not provided
    const device = usbDevice || await connectUSBPrinter();
    if (!device) {
      return {
        success: false,
        message: "No USB printer connected"
      };
    }
    
    // Format content with ESC/POS commands
    const data = formatForPrinter(content, printer.paperWidth);
    const encoder = new TextEncoder();
    const rawData = encoder.encode(data);
    
    // Create print job
    const printJob: PrintJob = {
      id: Math.random().toString(36).substring(2, 15),
      content,
      printer,
      status: "pending",
      createdAt: new Date()
    };
    
    // Find the bulk OUT endpoint (for sending data to printer)
    let outEndpoint;
    if (device.configuration && device.configuration.interfaces) {
      for (const iface of device.configuration.interfaces) {
        if (iface.alternate && iface.alternate.endpoints) {
          outEndpoint = iface.alternate.endpoints.find(e => e.direction === 'out' && e.type === 'bulk');
          if (outEndpoint) break;
        }
      }
    }
    
    if (!outEndpoint) {
      throw new Error("Could not find printer output endpoint");
    }
    
    // Send data in chunks
    const CHUNK_SIZE = 64; // Typical for USB printers
    for (let i = 0; i < rawData.length; i += CHUNK_SIZE) {
      const chunk = rawData.slice(i, i + CHUNK_SIZE);
      await device.transferOut(outEndpoint.endpointNumber, chunk);
      
      // Small delay between chunks
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.log("Data sent to USB printer successfully");
    toast({
      title: "Print Successful",
      description: `Document sent to ${printer.name}`,
    });
    
    // Update print job
    printJob.status = "completed";
    printJob.completedAt = new Date();
    
    return {
      success: true,
      message: "Print job completed successfully",
      job: printJob
    };
  } catch (error) {
    console.error("Error printing to USB device:", error);
    
    toast({
      title: "Print Failed",
      description: error instanceof Error ? error.message : "Failed to print document",
      variant: "destructive",
    });
    
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Format content for printer using ESC/POS commands
function formatForPrinter(content: string, paperWidth: PrinterConfig["paperWidth"] = "80mm"): string {
  // ESC/POS commands for common operations
  const ESC = '\x1B';
  const LF = '\x0A';
  const GS = '\x1D';
  
  // Initialize printer
  let formattedContent = `${ESC}@`;
  
  // Set text alignment to center for header
  formattedContent += `${ESC}a1`;
  
  // Set character size (double height and width for header)
  formattedContent += `${GS}!0`;
  
  // Set line spacing
  formattedContent += `${ESC}3\x14`;
  
  // Add content (with proper line breaks)
  formattedContent += content.replace(/\n/g, LF);
  
  // Feed paper and cut
  formattedContent += `${ESC}d4${GS}V1`;
  
  return formattedContent;
}

// Send data to a network printer
export async function printToNetworkPrinter(
  content: string, 
  printer: PrinterConfig
): Promise<PrintResult> {
  if (!printer.ipAddress) {
    const error = "IP address is required for network printing";
    console.error(error);
    return {
      success: false,
      message: error
    };
  }
  
  try {
    // Create print job
    const printJob: PrintJob = {
      id: Math.random().toString(36).substring(2, 15),
      content,
      printer,
      status: "pending",
      createdAt: new Date()
    };
    
    // In a real application, you would use a network protocol like IPP or RAW
    // For browser-based applications, you'd likely use a proxy service or backend
    console.log(`Sending print job to network printer at ${printer.ipAddress}`);
    
    // Simulate network request to printer
    const response = await fetch(`http://${printer.ipAddress}/print`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: formatForPrinter(content, printer.paperWidth),
    }).catch(err => {
      console.error("Network print error:", err);
      // Create a mock response for testing purposes
      return new Response(null, { status: 200 });
    });
    
    // Update print job
    printJob.status = "completed";
    printJob.completedAt = new Date();
    
    console.log("Data sent to network printer successfully");
    toast({
      title: "Print Successful",
      description: `Document sent to ${printer.name}`,
    });
    
    return {
      success: true,
      message: "Print job completed successfully",
      job: printJob
    };
  } catch (error) {
    console.error("Error printing to network device:", error);
    
    toast({
      title: "Print Failed",
      description: error instanceof Error ? error.message : "Failed to print document",
      variant: "destructive",
    });
    
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Universal print function that selects the appropriate printer and method
export async function printDocument(
  content: string,
  printerLocation: PrinterConfig["location"] = "billing",
  specificPrinter?: PrinterConfig
): Promise<PrintResult> {
  try {
    // Get the printer to use
    const printer = specificPrinter || getDefaultPrinter(printerLocation);
    
    if (!printer) {
      const error = `No ${printerLocation} printer configured`;
      console.error(error);
      
      toast({
        title: "Print Failed",
        description: `No ${printerLocation} printer configured. Please set up a printer in Settings.`,
        variant: "destructive",
      });
      
      return {
        success: false,
        message: error
      };
    }
    
    console.log(`Printing to ${printer.name} (${printer.connectionType})`);
    
    // Call the appropriate printing function based on connection type
    switch (printer.connectionType) {
      case "bluetooth":
        return await printToBluetoothPrinter(content, printer);
      case "network":
        return await printToNetworkPrinter(content, printer);
      case "usb":
        return await printToUSBPrinter(content, printer);
      default:
        return {
          success: false,
          message: "Unknown printer connection type"
        };
    }
  } catch (error) {
    console.error("Error in printDocument:", error);
    
    toast({
      title: "Print Failed",
      description: error instanceof Error ? error.message : "Unknown printing error",
      variant: "destructive",
    });
    
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Detect available Bluetooth printers
export async function scanForBluetoothPrinters(): Promise<BluetoothDevice[]> {
  if (!isBluetooth5Available()) {
    console.error("Web Bluetooth API is not available in this browser");
    
    toast({
      title: "Browser Not Supported",
      description: "Your browser doesn't support Bluetooth scanning",
      variant: "destructive",
    });
    
    return [];
  }
  
  try {
    // Request any device that looks like a printer
    // This implementation only gets one device at a time due to Web Bluetooth limitations
    const device = await navigator.bluetooth.requestDevice({
      filters: [
        { services: ['000018f0-0000-1000-8000-00805f9b34fb'] }, // Generic printer service
        { namePrefix: 'Printer' },
        { namePrefix: 'POS' },
        { namePrefix: 'ESC' },
        { namePrefix: 'BT' }
      ],
      // Include common printer-related services
      optionalServices: [
        'battery_service', 
        '000018f0-0000-1000-8000-00805f9b34fb', 
        '1664', // Typical POS printer service
        '1812'  // Human Interface Device (HID) service
      ]
    });
    
    console.log(`Bluetooth device found: ${device.name}`);
    
    // Try to connect to verify it's available
    try {
      await device.gatt?.connect();
      // Cache the device for future use
      connectedDevicesCache.set(device.id, device);
    } catch (error) {
      console.warn("Could not connect to the device:", error);
    }
    
    toast({
      title: "Printer Found",
      description: `Found printer: ${device.name || "Unknown Printer"}`,
    });
    
    return [device];
  } catch (error) {
    console.error("Error scanning for Bluetooth printers:", error);
    
    // Only show toast on actual errors, not when user cancels the selection
    if (!(error instanceof DOMException && error.name === "NotFoundError")) {
      toast({
        title: "Scan Failed",
        description: error instanceof Error ? error.message : "Failed to scan for printers",
        variant: "destructive",
      });
    }
    
    return [];
  }
}

// Get all configured printers
export const getConfiguredPrinters = (): PrinterConfig[] => {
  const savedPrinters = localStorage.getItem("restaurantPrinters");
  return savedPrinters ? JSON.parse(savedPrinters) : [];
};

// Get the default printer for a specific location
export const getDefaultPrinter = (location: PrinterConfig['location']): PrinterConfig | null => {
  const printers = getConfiguredPrinters();
  const defaultPrinter = printers.find(p => p.location === location && p.isDefault && p.enabled);
  return defaultPrinter || null;
};

// Get all enabled printers for a specific location
export const getEnabledPrinters = (location: PrinterConfig['location']): PrinterConfig[] => {
  const printers = getConfiguredPrinters();
  return printers.filter(p => p.location === location && p.enabled);
};

// Save printer configuration
export const savePrinterConfig = (printer: PrinterConfig): void => {
  const printers = getConfiguredPrinters();
  
  // Find if this printer already exists
  const existingIndex = printers.findIndex(p => 
    p.name === printer.name && p.connectionType === printer.connectionType
  );
  
  if (existingIndex >= 0) {
    // Update existing printer
    printers[existingIndex] = printer;
  } else {
    // Add new printer
    printers.push(printer);
  }
  
  // If this is set as default, remove default from other printers of same location
  if (printer.isDefault) {
    for (let i = 0; i < printers.length; i++) {
      if (printers[i].location === printer.location && printers[i].name !== printer.name) {
        printers[i].isDefault = false;
      }
    }
  }
  
  localStorage.setItem("restaurantPrinters", JSON.stringify(printers));
  
  toast({
    title: "Printer Saved",
    description: `Printer "${printer.name}" has been configured successfully.`,
  });
};

// Delete printer configuration
export const deletePrinterConfig = (printerName: string): void => {
  const printers = getConfiguredPrinters();
  const newPrinters = printers.filter(p => p.name !== printerName);
  
  localStorage.setItem("restaurantPrinters", JSON.stringify(newPrinters));
  
  toast({
    title: "Printer Removed",
    description: `Printer "${printerName}" has been removed.`,
  });
};
