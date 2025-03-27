
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Order, calculateOrderTotal, formatCurrency } from "@/utils/orderUtils";
import { getMenuItemById } from "@/utils/menuData";
import { cn } from "@/lib/utils";

interface OrderSummaryProps {
  order: Order;
  onPrint: () => void;
  onChangeStatus: (status: Order["status"]) => void;
  onClose?: () => void;
  showActions?: boolean;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  order,
  onPrint,
  onChangeStatus,
  onClose,
  showActions = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const total = calculateOrderTotal(order);
  
  const statusColors: Record<Order["status"], string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    preparing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    ready: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    served: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    completed: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 font-medium">
              Table {order.tableNumber}
            </span>
            <h3 className="text-lg font-bold mt-2 text-gray-900 dark:text-white">
              Order #{order.id.slice(0, 8)}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(order.createdAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true
              })}
              {" • "}
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex flex-col items-end">
            <span className={cn("text-xs px-2 py-1 rounded-full font-medium", statusColors[order.status])}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
            
            <p className="text-2xl font-bold mt-2 text-blue-600 dark:text-blue-400">
              {formatCurrency(total)}
            </p>
          </div>
        </div>
        
        <div 
          className="cursor-pointer flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-700"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
          </span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={cn("h-5 w-5 text-gray-500 transition-transform", 
              isExpanded ? "transform rotate-180" : ""
            )} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 space-y-2 overflow-hidden"
            >
              {order.items.map((item) => {
                const menuItem = getMenuItemById(item.menuItemId);
                if (!menuItem) return null;
                
                return (
                  <div key={item.id} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                    <div className="flex-1">
                      <div className="flex items-start">
                        <span className="inline-block text-sm font-medium mr-2">
                          {item.quantity}x
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {menuItem.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {menuItem.nameEn}
                          </p>
                          {item.notes && (
                            <p className="text-xs italic mt-1 text-gray-600 dark:text-gray-300">
                              Note: {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white ml-4">
                      {formatCurrency(menuItem.price * item.quantity)}
                    </p>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
        
        {showActions && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
            {order.status === "pending" && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                onClick={onPrint}
              >
                Print Order
              </motion.button>
            )}
            
            {order.status === "pending" && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors"
                onClick={() => onChangeStatus("preparing")}
              >
                Start Preparing
              </motion.button>
            )}
            
            {order.status === "preparing" && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                onClick={() => onChangeStatus("ready")}
              >
                Mark Ready
              </motion.button>
            )}
            
            {order.status === "ready" && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                onClick={() => onChangeStatus("served")}
              >
                Mark Served
              </motion.button>
            )}
            
            {order.status === "served" && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                onClick={() => onChangeStatus("completed")}
              >
                Complete Order
              </motion.button>
            )}
            
            {onClose && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 font-medium rounded-lg transition-colors"
                onClick={onClose}
              >
                Close
              </motion.button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default OrderSummary;
