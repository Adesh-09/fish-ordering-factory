
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Printer, X, Settings, Bluetooth, Wifi, UsbIcon, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getConfiguredPrinters, printDocument, testPrinterConnection } from "@/utils/printerUtils";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { PrinterConfig } from "@/types/printerTypes";
import { useIsMobile } from "@/hooks/use-mobile";
import BluetoothPrinterScanner from "./BluetoothPrinterScanner";

interface PrintButtonProps {
  onPrint?: (content: string) => void;
  printContent?: string;
}

const PrintButton: React.FC<PrintButtonProps> = ({ onPrint, printContent }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showPrinterScanner, setShowPrinterScanner] = useState(false);
  const [activePrinters, setActivePrinters] = useState<PrinterConfig[]>([]);
  const [checkingPrinters, setCheckingPrinters] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Get saved printers whenever the modal is opened
    if (isOpen) {
      refreshPrinters();
    }
  }, [isOpen]);
  
  const refreshPrinters = async () => {
    const printers = getConfiguredPrinters();
    setActivePrinters([]);
    setCheckingPrinters(true);
    
    // Check each printer's connection
    const connectedPrinters: PrinterConfig[] = [];
    
    for (const printer of printers) {
      try {
        const isConnected = await testPrinterConnection(printer);
        if (isConnected) {
          connectedPrinters.push({
            ...printer,
            status: "online"
          });
        }
      } catch (error) {
        console.error(`Error testing printer ${printer.name}:`, error);
      }
    }
    
    setActivePrinters(connectedPrinters);
    setCheckingPrinters(false);
    
    if (connectedPrinters.length === 0 && printers.length > 0) {
      toast({
        title: "No Active Printers",
        description: "Could not connect to any configured printers. Please check your printer connections.",
        // Changed from "warning" to "default" since "warning" is not an allowed variant
        variant: "default",
      });
    } else if (connectedPrinters.length > 0) {
      toast({
        title: "Printers Ready",
        description: `${connectedPrinters.length} printer${connectedPrinters.length === 1 ? '' : 's'} connected and ready.`,
      });
    }
  };
  
  const handlePrint = async (location?: string) => {
    if (!printContent && !onPrint) {
      toast({
        title: "No content to print",
        description: "Please provide content to print",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsPrinting(true);
      
      if (onPrint && printContent) {
        onPrint(printContent);
      } else if (printContent) {
        const success = await printDocument(printContent, location as any);
        
        if (success) {
          toast({
            title: "Print Success",
            description: `Document sent to ${location} printer`,
          });
        }
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error("Print error:", error);
      toast({
        title: "Print Failed",
        description: error instanceof Error ? error.message : "Failed to print",
        variant: "destructive",
      });
    } finally {
      setIsPrinting(false);
    }
  };
  
  const handleBluetoothSelected = (device: BluetoothDevice, printer: PrinterConfig) => {
    setActivePrinters(prev => [...prev, printer]);
    setShowPrinterScanner(false);
  };
  
  const getPrinterIcon = (type: string) => {
    switch (type) {
      case 'bluetooth':
        return <Bluetooth className="h-4 w-4 mr-2" />;
      case 'network':
        return <Wifi className="h-4 w-4 mr-2" />;
      case 'usb':
        return <UsbIcon className="h-4 w-4 mr-2" />;
      default:
        return <Printer className="h-4 w-4 mr-2" />;
    }
  };
  
  return (
    <>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          className="h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsOpen(true)}
        >
          <Printer className="h-6 w-6" />
        </Button>
      </motion.div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Print Options
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {showPrinterScanner ? (
                <div>
                  <BluetoothPrinterScanner 
                    onPrinterSelected={() => {}}
                    onConnectionSuccess={handleBluetoothSelected}
                  />
                  <div className="mt-4 flex justify-end">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowPrinterScanner(false)}
                    >
                      Back
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between mb-4">
                    <h4 className="font-medium">Available Printers</h4>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={refreshPrinters} 
                      disabled={checkingPrinters}
                      className="text-blue-600"
                    >
                      <RefreshCcw className={`h-4 w-4 mr-1 ${checkingPrinters ? 'animate-spin' : ''}`} />
                      {checkingPrinters ? 'Checking...' : 'Refresh'}
                    </Button>
                  </div>
                
                  {activePrinters.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="mx-auto w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                        <Printer className="h-6 w-6 text-yellow-600" />
                      </div>
                      <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
                        No active printers
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Connect a printer or set one up in settings.
                      </p>
                      <div className="flex flex-col space-y-2">
                        <Button
                          variant="default"
                          className="bg-blue-600 hover:bg-blue-700 w-full"
                          onClick={() => setShowPrinterScanner(true)}
                        >
                          <Bluetooth className="h-4 w-4 mr-2" />
                          Connect Bluetooth Printer
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setIsOpen(false);
                            navigate("/settings");
                          }}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Printer Settings
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="divide-y border rounded-lg overflow-hidden">
                        {activePrinters.map((printer, index) => (
                          <div key={index} className="p-3 bg-white dark:bg-gray-700 flex justify-between items-center">
                            <div className="flex items-center">
                              {getPrinterIcon(printer.connectionType)}
                              <div>
                                <p className="font-medium">{printer.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {printer.location} • {printer.paperWidth}
                                </p>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handlePrint(printer.location)}
                              disabled={isPrinting}
                            >
                              <Printer className="h-4 w-4 mr-1" />
                              Print
                            </Button>
                          </div>
                        ))}
                      </div>
                      
                      <div className="pt-4 flex justify-between">
                        <Button
                          variant="outline"
                          size={isMobile ? "mobile" : "default"}
                          onClick={() => setShowPrinterScanner(true)}
                        >
                          <Bluetooth className="h-4 w-4 mr-1" />
                          Add Printer
                        </Button>
                        <Button
                          variant="outline"
                          size={isMobile ? "mobile" : "default"}
                          onClick={() => {
                            setIsOpen(false);
                            navigate("/settings");
                          }}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PrintButton;
