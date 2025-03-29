
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Printer, X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getConfiguredPrinters, printDocument } from "@/utils/printerUtils";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface PrintButtonProps {
  onPrint?: (content: string) => void;
  printContent?: string;
}

const PrintButton: React.FC<PrintButtonProps> = ({ onPrint, printContent }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const navigate = useNavigate();
  
  const printers = getConfiguredPrinters();
  const hasPrinters = printers.length > 0;
  
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
        await printDocument(printContent, location as any);
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
              
              {!hasPrinters ? (
                <div className="text-center py-6">
                  <div className="mx-auto w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                    <Printer className="h-6 w-6 text-yellow-600" />
                  </div>
                  <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
                    No printers configured
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    You need to set up at least one printer to use this feature.
                  </p>
                  <Button
                    variant="default"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/settings");
                    }}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Printers
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Button
                    variant="default"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => handlePrint("billing")}
                    disabled={isPrinting}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    {isPrinting ? "Printing..." : "Print to Billing Printer"}
                  </Button>
                  
                  <Button
                    variant="default"
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => handlePrint("kitchen")}
                    disabled={isPrinting}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    {isPrinting ? "Printing..." : "Print to Kitchen Printer"}
                  </Button>
                  
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700 mt-3">
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
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PrintButton;
