
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { scanForBluetoothPrinters } from "@/utils/printerUtils";
import { toast } from "@/components/ui/use-toast";
import { Bluetooth, Printer, Search } from "lucide-react";

interface BluetoothPrinterScannerProps {
  onPrinterSelected: (device: BluetoothDevice) => void;
}

const BluetoothPrinterScanner: React.FC<BluetoothPrinterScannerProps> = ({ 
  onPrinterSelected 
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [foundDevices, setFoundDevices] = useState<BluetoothDevice[]>([]);
  
  const handleScan = async () => {
    try {
      setIsScanning(true);
      const devices = await scanForBluetoothPrinters();
      setFoundDevices(devices);
      
      if (devices.length === 0) {
        toast({
          title: "No printers found",
          description: "Couldn't find any Bluetooth printers nearby. Make sure your printer is powered on and in pairing mode.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error scanning for Bluetooth printers:", error);
      toast({
        title: "Bluetooth Error",
        description: error instanceof Error ? error.message : "Failed to scan for Bluetooth printers",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Bluetooth Printer Discovery</h3>
        <Button 
          onClick={handleScan} 
          disabled={isScanning}
          className="bg-blue-600 hover:bg-blue-700"
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
      
      {foundDevices.length > 0 && (
        <div className="border rounded-md p-4 space-y-3">
          <h4 className="font-medium">Available Printers</h4>
          <div className="divide-y">
            {foundDevices.map((device, index) => (
              <div key={index} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">{device.name || "Unknown Printer"}</p>
                  <p className="text-sm text-gray-500">{device.id}</p>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => onPrinterSelected(device)}
                  className="flex items-center"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Select
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
