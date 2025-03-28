
import React, { useState } from "react";
import { OrderItem as OrderItemType } from "@/utils/orderUtils";
import { MenuItem, getMenuItemById } from "@/utils/menuData";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/orderUtils";
import { ShoppingBag } from "lucide-react";

interface OrderItemProps {
  item: OrderItemType;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onAddNote: (id: string, note: string) => void;
}

const OrderItem: React.FC<OrderItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  onAddNote,
}) => {
  const menuItem = getMenuItemById(item.menuItemId) as MenuItem;
  const [isExpanded, setIsExpanded] = useState(false);
  const [note, setNote] = useState(item.notes || "");
  
  if (!menuItem) return null;
  
  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value);
  };
  
  const handleNoteSave = () => {
    onAddNote(item.id, note);
    setIsExpanded(false);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-3 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-1">
            <h3 className="font-medium text-gray-900 dark:text-white">
              {menuItem.name}
            </h3>
            {item.isTakeAway && (
              <ShoppingBag className="h-4 w-4 text-amber-500" />
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {menuItem.nameEn}
          </p>
        </div>
        
        <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
          {formatCurrency(menuItem.price * item.quantity)}
        </div>
      </div>
      
      {item.notes && !isExpanded && (
        <div className="mt-2 text-sm italic text-gray-600 dark:text-gray-300">
          Note: {item.notes}
        </div>
      )}
      
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            −
          </button>
          
          <span className="w-8 text-center font-medium">{item.quantity}</span>
          
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            +
          </button>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "text-sm px-3 py-1 rounded-full transition-colors",
              isExpanded
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            )}
          >
            {isExpanded ? "Cancel" : item.notes ? "Edit Note" : "Add Note"}
          </button>
          
          <button
            onClick={() => onRemove(item.id)}
            className="text-sm px-3 py-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3"
        >
          <textarea
            value={note}
            onChange={handleNoteChange}
            placeholder="Add special instructions..."
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            rows={2}
          />
          
          <div className="flex justify-end mt-2">
            <button
              onClick={handleNoteSave}
              className="px-3 py-1 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Save Note
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default OrderItem;
