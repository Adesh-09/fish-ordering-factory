
import React from "react";
import { motion } from "framer-motion";
import { Order, calculateOrderTotal, formatCurrency } from "@/utils/orderUtils";
import { getMenuItemById } from "@/utils/menuData";

interface BillPreviewProps {
  order: Order;
  onPrint: () => void;
}

const BillPreview: React.FC<BillPreviewProps> = ({ order, onPrint }) => {
  const total = calculateOrderTotal(order);
  const gst = total * 0.05; // Assuming 5% GST
  const grandTotal = total + gst;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden max-w-md w-full mx-auto"
    >
      <div className="p-6">
        <div className="text-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
          <h2 className="text-xl font-bold">जयेश मच्छी खानावल</h2>
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
          <p className="text-sm font-medium mt-2">
            Table: {order.tableNumber}
          </p>
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
            {order.items.map((item) => {
              const menuItem = getMenuItemById(item.menuItemId);
              if (!menuItem) return null;
              
              return (
                <div 
                  key={item.id} 
                  className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 text-sm"
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
                </div>
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
          
          <div className="flex justify-between text-base font-bold mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <span>Total:</span>
            <span className="text-blue-600 dark:text-blue-400">
              {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={onPrint}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
            </svg>
            Print Bill
          </button>
        </div>
        
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
          <p>Thank you for dining with us!</p>
          <p>Please visit again.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default BillPreview;
