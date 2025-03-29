
import React from "react";
import { Order, formatCurrency } from "@/utils/orderUtils";
import { getMenuItemById } from "@/utils/menuData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";

interface OrderSummaryProps {
  order: Order;
  onPrint: () => void;
  onChangeStatus?: (status: Order["status"]) => void;
  onClose?: () => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  order,
  onPrint,
  onChangeStatus,
  onClose,
}) => {
  const total = order.items.reduce((sum, item) => {
    const menuItem = getMenuItemById(item.menuItemId);
    if (menuItem) {
      return sum + menuItem.price * item.quantity;
    }
    return sum;
  }, 0);

  return (
    <div className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <div className="flex justify-between items-start">
        <div>
          <Badge variant={order.isTakeAway ? "warning" : "default"}>
            {order.isTakeAway ? "Take Away" : `Table ${order.tableNumber}`}
          </Badge>
          <h3 className="text-xl font-bold mt-2">
            Order #{order.orderNumber}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ID: {order.id.slice(0, 8)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        
        <div className="flex flex-col items-end">
          <Badge
            variant={
              order.status === "completed"
                ? "success"
                : order.status === "ready"
                ? "success"
                : order.status === "preparing"
                ? "warning"
                : "default"
            }
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 mt-1"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="font-medium mb-2">Items</h4>
        <ul className="space-y-2">
          {order.items.map((item) => {
            const menuItem = getMenuItemById(item.menuItemId);
            if (!menuItem) return null;
            
            return (
              <li
                key={item.id}
                className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
              >
                <div className="flex items-start">
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-1 rounded-md mr-2">
                    {item.quantity}x
                  </span>
                  <div>
                    <p className="font-medium">{menuItem.nameEn}</p>
                    {item.notes && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Note: {item.notes}
                      </p>
                    )}
                  </div>
                </div>
                <p className="font-medium">
                  {formatCurrency(menuItem.price * item.quantity)}
                </p>
              </li>
            );
          })}
        </ul>
      </div>

      {order.notes && (
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md mt-4">
          <h4 className="font-medium text-sm mb-1">Order Notes:</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">{order.notes}</p>
        </div>
      )}

      <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700 font-bold">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>

      {onPrint && (
        <div className="mt-4">
          <Button
            className="w-full"
            variant="default"
            onClick={onPrint}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print Order
          </Button>
        </div>
      )}

      {onChangeStatus && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          {order.status === "pending" && (
            <Button
              variant="warning"
              onClick={() => onChangeStatus("preparing")}
            >
              Start Preparing
            </Button>
          )}
          {order.status === "preparing" && (
            <Button
              variant="success"
              onClick={() => onChangeStatus("ready")}
            >
              Mark as Ready
            </Button>
          )}
          {order.status === "ready" && (
            <Button
              variant="success"
              onClick={() => onChangeStatus("served")}
            >
              Mark as Served
            </Button>
          )}
          {(order.status === "served" || order.status === "ready") && (
            <Button
              variant="destructive"
              onClick={() => onChangeStatus("completed")}
            >
              Complete Order
            </Button>
          )}
          {order.status !== "cancelled" && (
            <Button
              variant="destructive"
              onClick={() => onChangeStatus("cancelled")}
            >
              Cancel Order
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderSummary;
