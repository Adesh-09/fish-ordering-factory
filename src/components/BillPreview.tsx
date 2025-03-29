
import React from "react";
import { Button } from "@/components/ui/button";
import { Order, calculateOrderTotal, formatCurrency } from "@/utils/orderUtils";
import { getMenuItemById } from "@/utils/menuData";
import { motion } from "framer-motion";
import { Printer } from "lucide-react";

interface BillPreviewProps {
  order: Order;
  onPrint: () => void;
}

const BillPreview: React.FC<BillPreviewProps> = ({ order, onPrint }) => {
  const subtotal = calculateOrderTotal(order);
  const gst = subtotal * 0.05; // 5% GST
  const total = subtotal + gst;

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg max-w-md mx-auto"
    >
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          JAYESH MACHHI KHANAVAL
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Bill Receipt
        </p>
      </div>

      <div className="py-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Order #:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {order.orderNumber || order.id.slice(0, 8)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Table:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {order.tableNumber}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Date:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {new Date(order.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Time:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {new Date(order.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        {order.isTakeAway && (
          <div className="text-center text-amber-600 dark:text-amber-400 font-medium py-1">
            *** TAKE AWAY ***
          </div>
        )}
      </div>

      <div className="border-t border-b border-gray-200 dark:border-gray-700 py-4">
        <div className="flex justify-between font-medium text-gray-900 dark:text-white pb-2">
          <span>ITEM</span>
          <div className="flex space-x-6">
            <span>QTY</span>
            <span>AMOUNT</span>
          </div>
        </div>

        <div className="space-y-2">
          {order.items.map((item) => {
            const menuItem = getMenuItemById(item.menuItemId);
            if (!menuItem) return null;

            const itemTotal = menuItem.price * item.quantity;

            return (
              <div key={item.id} className="flex justify-between text-sm py-1">
                <span className="text-gray-800 dark:text-gray-200 truncate max-w-[180px]">
                  {menuItem.nameEn}
                </span>
                <div className="flex space-x-6">
                  <span className="text-gray-800 dark:text-gray-200 text-right w-8">
                    {item.quantity}
                  </span>
                  <span className="text-gray-800 dark:text-gray-200 text-right w-16">
                    {formatCurrency(itemTotal)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
          <span className="text-gray-800 dark:text-gray-200">
            {formatCurrency(subtotal)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">GST (5%):</span>
          <span className="text-gray-800 dark:text-gray-200">
            {formatCurrency(gst)}
          </span>
        </div>
        <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200 dark:border-gray-700">
          <span>TOTAL:</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="text-center text-gray-500 dark:text-gray-400 text-sm mt-6">
        <p>Thank you for dining with us!</p>
        <p>Please visit again.</p>
      </div>

      <Button
        onClick={onPrint}
        className="w-full mt-6"
        size="lg"
      >
        <Printer className="mr-2 h-4 w-4" />
        Print Bill
      </Button>
    </motion.div>
  );
};

export default BillPreview;
