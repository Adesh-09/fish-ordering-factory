
import React from "react";
import { motion } from "framer-motion";
import { Order, getTimeElapsed } from "@/utils/orderUtils";
import { getMenuItemById } from "@/utils/menuData";
import { cn } from "@/lib/utils";

interface KitchenOrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, status: Order["status"]) => void;
}

const KitchenOrderCard: React.FC<KitchenOrderCardProps> = ({
  order,
  onStatusChange,
}) => {
  const bgColors: Record<Order["status"], string> = {
    pending: "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800/30",
    preparing: "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/30",
    ready: "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/30",
    served: "bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800/30",
    completed: "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700",
    cancelled: "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30",
  };
  
  const statusColors: Record<Order["status"], string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    preparing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    ready: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    served: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    completed: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };
  
  const getNextAction = () => {
    switch (order.status) {
      case "pending":
        return {
          label: "Start Preparing",
          status: "preparing" as Order["status"],
          color: "bg-yellow-500 hover:bg-yellow-600 text-white",
        };
      case "preparing":
        return {
          label: "Mark Ready",
          status: "ready" as Order["status"],
          color: "bg-green-500 hover:bg-green-600 text-white",
        };
      case "ready":
        return {
          label: "Mark Served",
          status: "served" as Order["status"],
          color: "bg-purple-500 hover:bg-purple-600 text-white",
        };
      default:
        return null;
    }
  };
  
  const nextAction = getNextAction();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "rounded-xl shadow-sm border-2 overflow-hidden",
        bgColors[order.status]
      )}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className="text-sm font-bold bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm">
              Table {order.tableNumber}
            </span>
            <h3 className="mt-2 text-lg font-bold">Order #{order.id.slice(0, 8)}</h3>
          </div>
          
          <div className="flex flex-col items-end">
            <span className={cn("text-xs px-2 py-1 rounded-full font-medium", statusColors[order.status])}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
            
            <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">
              {getTimeElapsed(new Date(order.createdAt))}
            </p>
          </div>
        </div>
        
        <div className="space-y-2 mt-4">
          {order.items.map((item) => {
            const menuItem = getMenuItemById(item.menuItemId);
            if (!menuItem) return null;
            
            return (
              <div 
                key={item.id} 
                className="flex items-center bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"
              >
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-bold">
                  {item.quantity}
                </div>
                
                <div className="ml-3 flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {menuItem.nameEn}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {menuItem.name}
                  </p>
                  
                  {item.notes && (
                    <p className="text-xs italic mt-1 text-red-600 dark:text-red-400">
                      Note: {item.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {nextAction && (
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => onStatusChange(order.id, nextAction.status)}
              className={cn(
                "w-full py-2 rounded-lg font-medium transition-colors",
                nextAction.color
              )}
            >
              {nextAction.label}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default KitchenOrderCard;
