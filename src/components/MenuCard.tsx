
import React from "react";
import { motion } from "framer-motion";
import { MenuItem } from "@/utils/menuData";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/orderUtils";

interface MenuCardProps {
  item: MenuItem;
  isSelected?: boolean;
  onSelect: (item: MenuItem) => void;
  className?: string;
}

const MenuCard: React.FC<MenuCardProps> = ({
  item,
  isSelected = false,
  onSelect,
  className,
}) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(item)}
      className={cn(
        "relative overflow-hidden rounded-xl p-4 cursor-pointer transition-all",
        isSelected
          ? "bg-blue-50 border-2 border-blue-500 shadow-md dark:bg-blue-900/20"
          : "bg-white border border-gray-200 shadow-sm hover:shadow-md dark:bg-gray-800 dark:border-gray-700",
        className
      )}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
          Selected
        </div>
      )}
      
      <div className="flex flex-col h-full">
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {item.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {item.nameEn}
          </p>
        </div>
        
        {item.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 flex-grow">
            {item.description}
          </p>
        )}
        
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 dark:border-gray-700">
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(item.price)}
          </span>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(item);
            }}
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium transition-colors",
              isSelected
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            )}
          >
            {isSelected ? "Added" : "Add"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MenuCard;
