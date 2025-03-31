
import React from "react";
import { Order, formatCurrency } from "@/utils/orderUtils";
import { getMenuItemById } from "@/utils/menuData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer, X, ChevronDown, ChevronUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  const [isItemsExpanded, setIsItemsExpanded] = React.useState(true);
  
  const total = order.items.reduce((sum, item) => {
    const menuItem = getMenuItemById(item.menuItemId);
    if (menuItem) {
      return sum + menuItem.price * item.quantity;
    }
    return sum;
  }, 0);

  // Helper function to map status to badge variant
  const getStatusVariant = (status: Order["status"]) => {
    switch (status) {
      case "completed":
      case "ready":
      case "served":
        return "secondary"; // Using secondary for success states
      case "preparing":
        return "outline"; // Using outline for warning states
      default:
        return "default";
    }
  };

  const toggleItemsView = () => {
    setIsItemsExpanded(!isItemsExpanded);
  };

  return (
    <div className="space-y-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 rounded-lg shadow-md border border-[#E5E0DF] transform transition-all hover:shadow-lg">
      <div className="flex justify-between items-start">
        <div>
          <Badge variant={order.isTakeAway ? "outline" : "default"} className="bg-gradient-to-r from-[#F6C176] to-[#F8D193] text-[#3F4E4F] border-[#E5E0DF]">
            {order.isTakeAway ? "✨ Take Away" : `🪑 Table ${order.tableNumber}`}
          </Badge>
          <h3 className="text-xl font-bold mt-2 text-[#3F4E4F]">
            Order #{order.orderNumber}
          </h3>
          <p className="text-sm text-[#6C7A80] dark:text-gray-400">
            ID: {order.id.slice(0, 8)}
          </p>
          <p className="text-sm text-[#6C7A80] dark:text-gray-400">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        
        <div className="flex flex-col items-end">
          <Badge
            variant={getStatusVariant(order.status)}
            className="bg-gradient-to-r from-[#A6BB8D] to-[#B8CBAC] text-[#3F4E4F] border-[#E5E0DF]"
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 mt-1 rounded-full"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4 border-t border-[#E5E0DF] dark:border-gray-700 pt-4">
        <div className="flex justify-between items-center cursor-pointer" onClick={toggleItemsView}>
          <h4 className="font-medium text-[#3F4E4F]">Items</h4>
          <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
            {isItemsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        
        {isItemsExpanded && (
          <ul className="space-y-2 mt-2 max-h-[40vh] overflow-y-auto scrollbar-thin">
            {order.items.map((item) => {
              const menuItem = getMenuItemById(item.menuItemId);
              if (!menuItem) return null;
              
              return (
                <li
                  key={item.id}
                  className="flex justify-between items-center py-2 border-b border-[#E5E0DF]/50 dark:border-gray-800 last:border-0 hover:bg-[#F7F7F7] dark:hover:bg-gray-700/30 p-2 rounded-md transition-colors"
                >
                  <div className="flex items-start">
                    <span className="bg-[#EAF1EE] text-[#3F4E4F] dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded-md mr-2 font-medium">
                      {item.quantity}x
                    </span>
                    <div>
                      <p className="font-medium text-[#3F4E4F]">{menuItem.nameEn}</p>
                      {item.notes && (
                        <p className="text-xs text-[#6C7A80] dark:text-gray-400 mt-1">
                          Note: {item.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="font-medium text-[#3F4E4F]">
                    {formatCurrency(menuItem.price * item.quantity)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {order.notes && (
        <div className="bg-[#F7F9F7] dark:bg-gray-700 p-3 rounded-md mt-4 border border-[#E5E0DF]/50">
          <h4 className="font-medium text-sm mb-1 text-[#3F4E4F]">Order Notes:</h4>
          <p className="text-sm text-[#6C7A80] dark:text-gray-300">{order.notes}</p>
        </div>
      )}

      <div className="flex justify-between items-center pt-2 border-t border-[#E5E0DF] dark:border-gray-700 font-bold">
        <span className="text-[#3F4E4F]">Total</span>
        <span className="text-[#3F4E4F]">{formatCurrency(total)}</span>
      </div>

      {onPrint && (
        <div className="mt-4">
          <Button
            className="w-full"
            variant="default"
            size={isMobile ? "mobile" : "default"}
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
              variant="outline"
              size={isMobile ? "mobile" : "default"}
              onClick={() => onChangeStatus("preparing")}
            >
              Start Preparing
            </Button>
          )}
          {order.status === "preparing" && (
            <Button
              variant="secondary"
              size={isMobile ? "mobile" : "default"}
              onClick={() => onChangeStatus("ready")}
            >
              Mark as Ready
            </Button>
          )}
          {order.status === "ready" && (
            <Button
              variant="secondary"
              size={isMobile ? "mobile" : "default"}
              onClick={() => onChangeStatus("served")}
            >
              Mark as Served
            </Button>
          )}
          {(order.status === "served" || order.status === "ready") && (
            <Button
              variant="destructive"
              size={isMobile ? "mobile" : "default"}
              onClick={() => onChangeStatus("completed")}
            >
              Complete Order
            </Button>
          )}
          {order.status !== "cancelled" && (
            <Button
              variant="destructive"
              size={isMobile ? "mobile" : "default"}
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
