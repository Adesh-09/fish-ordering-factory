
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { scanForBluetoothPrinters, testPrinterConnection } from "@/utils/printerUtils";
import { toast } from "@/components/ui/use-toast";
import { Bluetooth, Printer, Search, RefreshCcw, CheckCircle2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { PrinterConfig } from "@/types/printerTypes";

interface BluetoothPrinterScannerProps {
  onPrinterSelected: (device: BluetoothDevice) => void;
  onConnectionSuccess?: (device: BluetoothDevice, printer: PrinterConfig) => void;
}

const BluetoothPrinterScanner: React.FC<BluetoothPrinterScannerProps> = ({ 
  onPrinterSelected,
  onConnectionSuccess 
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [foundDevices, setFoundDevices] = useState<BluetoothDevice[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<Record<string, string>>({});
  const isMobile = useIsMobile();
  const [isWebBluetoothAvailable, setIsWebBluetoothAvailable] = useState(false);
  
  useEffect(() => {
    // Check if Web Bluetooth API is available
    const checkBluetoothAvailability = () => {
      const isAvailable = navigator.bluetooth !== undefined;
      setIsWebBluetoothAvailable(isAvailable);
      
      if (!isAvailable) {
        toast({
          title: "Bluetooth Not Available",
          description: "Your device or browser doesn't support Web Bluetooth API. Try using Chrome on Android, macOS, or Windows.",
          variant: "destructive",
        });
      }
    };
    
    checkBluetoothAvailability();
  }, []);
  
  const handleScan = async () => {
    try {
      if (!isWebBluetoothAvailable) {
        toast({
          title: "Bluetooth Error",
          description: "Web Bluetooth API is not available in this browser. Try using Chrome.",
          variant: "destructive",
        });
        return;
      }
      
      setIsScanning(true);
      setFoundDevices([]);
      setConnectionStatus({});
      
      const devices = await scanForBluetoothPrinters();
      setFoundDevices(devices);
      
      if (devices.length === 0) {
        toast({
          title: "No printers found",
          description: "Couldn't find any Bluetooth printers nearby. Make sure your printer is powered on and in pairing mode.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Printers Found",
          description: `Found ${devices.length} printer${devices.length === 1 ? '' : 's'}.`,
        });
      }
    } catch (error) {
      console.error("Error scanning for Bluetooth printers:", error);
      
      // Only show error if it's not a user cancellation
      if (!(error instanceof DOMException && error.name === "NotFoundError")) {
        toast({
          title: "Bluetooth Error",
          description: error instanceof Error ? error.message : "Failed to scan for Bluetooth printers",
          variant: "destructive",
        });
      }
    } finally {
      setIsScanning(false);
    }
  };
  
  const handleConnect = async (device: BluetoothDevice) => {
    try {
      setConnectionStatus(prev => ({...prev, [device.id]: "connecting"}));
      
      // Try to connect to the device
      if (!device.gatt) {
        throw new Error("GATT server not available on this device");
      }
      
      const server = await device.gatt.connect();
      if (!server) {
        throw new Error("Failed to connect to GATT server");
      }
      
      setConnectionStatus(prev => ({...prev, [device.id]: "connected"}));
      
      // Create a temporary printer config for testing
      const tempPrinterConfig: PrinterConfig = {
        name: device.name || "Bluetooth Printer",
        bluetoothId: device.id,
        connectionType: "bluetooth",
        isDefault: false,
        paperWidth: "80mm",
        enabled: true,
        location: "billing",
        status: "online"
      };
      
      // Notify about successful connection
      toast({
        title: "Printer Connected",
        description: `Successfully connected to ${device.name || "Unknown printer"}`,
        // Changed from "success" to "default" since "success" is not an allowed variant
        variant: "default",
      });
      
      onPrinterSelected(device);
      if (onConnectionSuccess) {
        onConnectionSuccess(device, tempPrinterConfig);
      }
      
    } catch (error) {
      console.error("Error connecting to Bluetooth printer:", error);
      setConnectionStatus(prev => ({...prev, [device.id]: "failed"}));
      
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to printer",
        variant: "destructive",
      });
    }
  };
  
  const getButtonContent = (deviceId: string) => {
    const status = connectionStatus[deviceId];
    
    switch (status) {
      case "connecting":
        return <>
          <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
          Connecting...
        </>;
      case "connected":
        return <>
          <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
          Connected
        </>;
      case "failed":
        return <>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Retry
        </>;
      default:
        return <>
          <Bluetooth className="h-4 w-4 mr-2" />
          Connect
        </>;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Bluetooth Printer Discovery</h3>
        <Button 
          onClick={handleScan} 
          disabled={isScanning || !isWebBluetoothAvailable}
          className={isWebBluetoothAvailable ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-500"}
          size={isMobile ? "mobile" : "default"}
        >
          {isScanning ? (
            <>
              <Search className="h-4 w-4 mr-2 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Bluetooth className="h-4 w-4 mr-2" />
              Scan for Printers
            </>
          )}
        </Button>
      </div>
      
      {!isWebBluetoothAvailable && (
        <div className="p-4 border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 rounded-md text-amber-800 dark:text-amber-300 text-sm">
          <p>Web Bluetooth is not supported in this browser. For the best experience:</p>
          <ul className="list-disc ml-5 mt-2">
            <li>Use Chrome on Android, Windows, or macOS</li>
            <li>Use Edge on Windows</li>
            <li>Firefox and Safari do not support Web Bluetooth currently</li>
          </ul>
        </div>
      )}
      
      {foundDevices.length > 0 && (
        <div className="border rounded-md p-4 space-y-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <h4 className="font-medium">Available Printers</h4>
          <div className="divide-y">
            {foundDevices.map((device, index) => (
              <div key={index} className="py-3 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                <div>
                  <p className="font-medium">{device.name || "Unknown Printer"}</p>
                  <p className="text-xs text-gray-500">{device.id}</p>
                </div>
                <Button 
                  variant={connectionStatus[device.id] === "connected" ? "secondary" : "outline"}
                  onClick={() => handleConnect(device)}
                  className="flex items-center"
                  size={isMobile ? "mobile" : "default"}
                  disabled={connectionStatus[device.id] === "connecting" || connectionStatus[device.id] === "connected"}
                >
                  {getButtonContent(device.id)}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BluetoothPrinterScanner;
