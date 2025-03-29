
import React from "react";
import { motion } from "framer-motion";
import { Order, calculateOrderTotal, formatCurrency } from "@/utils/orderUtils";
import { getMenuItemById } from "@/utils/menuData";
import { Printer, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { printDocument } from "@/utils/printerUtils";
import { toast } from "@/components/ui/use-toast";

interface BillPreviewProps {
  order: Order;
  onPrint: () => void;
}

const BillPreview: React.FC<BillPreviewProps> = ({ order, onPrint }) => {
  const total = calculateOrderTotal(order);
  const gst = total * 0.05; // Assuming 5% GST
  const grandTotal = total + gst;
  
  const handleDirectPrint = async () => {
    try {
      // Generate printable content
      let billContent = `
JAYESH MACHHI KHANAVAL
Invoice #: ${order.id.slice(0, 8)}
Date: ${new Date(order.createdAt).toLocaleDateString()}
Time: ${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
Table: ${order.tableNumber}
${order.isTakeAway ? "*** TAKE AWAY ***" : ""}
===============================
ITEM                QTY   AMOUNT
-------------------------------
`;

      // Add items
      order.items.forEach(item => {
        const menuItem = getMenuItemById(item.menuItemId);
        if (menuItem) {
          const itemTotal = menuItem.price * item.quantity;
          const itemName = menuItem.nameEn.slice(0, 18).padEnd(18);
          billContent += `${itemName} ${item.quantity.toString().padStart(3)}   ${formatCurrency(itemTotal)}\n`;
          
          if (item.notes) {
            billContent += `  Note: ${item.notes}\n`;
          }
        }
      });

      billContent += `
-------------------------------
Subtotal:           ${formatCurrency(total)}
GST (5%):           ${formatCurrency(gst)}
===============================
TOTAL:              ${formatCurrency(grandTotal)}

Thank you for dining with us!
Please visit again.
`;

      // Send to printer
      const result = await printDocument(billContent, "billing");
      
      if (result.success) {
        toast({
          title: "Bill Printed Successfully",
          description: "The bill has been sent to your printer.",
        });
        
        // Execute callback to update UI/state
        onPrint();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "Print Failed",
        description: error instanceof Error ? error.message : "Failed to print bill",
        variant: "destructive",
      });
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden max-w-md w-full mx-auto"
    >
      <div className="p-6">
        <div className="text-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
          <motion.h2 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="text-xl font-bold"
          >
            जयेश मच्छी खानावल
          </motion.h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Jayesh Machhi Khanaval
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Invoice #: {order.id.slice(0, 8)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Date: {new Date(order.createdAt).toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Time: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm font-medium mt-2"
          >
            Table: {order.tableNumber}
          </motion.p>
          {order.isTakeAway && (
            <motion.p 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
              className="text-sm font-medium mt-1 bg-amber-100 text-amber-800 inline-block px-2 py-1 rounded"
            >
              Take Away
            </motion.p>
          )}
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <span>Item</span>
            <div className="flex">
              <span className="w-16 text-right">Price</span>
              <span className="w-10 text-center">Qty</span>
              <span className="w-20 text-right">Amount</span>
            </div>
          </div>
          
          <div className="space-y-2">
            {order.items.map((item, index) => {
              const menuItem = getMenuItemById(item.menuItemId);
              if (!menuItem) return null;
              
              return (
                <motion.div 
                  key={item.id} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors rounded px-2"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {menuItem.nameEn}
                    </p>
                    {item.notes && (
                      <p className="text-xs italic text-gray-500 dark:text-gray-400 mt-1">
                        {item.notes}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex">
                    <span className="w-16 text-right text-gray-700 dark:text-gray-300">
                      {formatCurrency(menuItem.price)}
                    </span>
                    <span className="w-10 text-center text-gray-700 dark:text-gray-300">
                      {item.quantity}
                    </span>
                    <span className="w-20 text-right font-medium text-gray-900 dark:text-white">
                      {formatCurrency(menuItem.price * item.quantity)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
        
        <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(total)}
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">GST (5%):</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(gst)}
            </span>
          </div>
          
          <motion.div 
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.5 }}
            className="flex justify-between text-base font-bold mt-2 pt-2 border-t border-gray-200 dark:border-gray-700"
          >
            <span>Total:</span>
            <span className="text-blue-600 dark:text-blue-400">
              {formatCurrency(grandTotal)}
            </span>
          </motion.div>
        </div>
        
        <div className="mt-6 space-y-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={handleDirectPrint}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <Printer className="h-5 w-5 mr-2" />
              Print Bill
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button variant="outline" className="w-full">
              <Share className="h-4 w-4 mr-2" />
              Share Bill
            </Button>
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6"
        >
          <p>Thank you for dining with us!</p>
          <p>Please visit again.</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default BillPreview;
