import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  Order, 
  createOrder, 
  calculateOrderTotal, 
  updateOrderStatus, 
  markOrderAsPrinted,
  updateInventoryFromOrder,
  saveOrderAnalytics,
  generatePrintableOrder,
  formatCurrency
} from "@/utils/orderUtils";
import { printDocument } from "@/utils/printerUtils";
import { toast } from "@/components/ui/use-toast";
import { getInventoryItems, saveInventoryItems } from "@/utils/inventoryUtils";

interface OrdersContextType {
  orders: Order[];
  activeOrder: Order | null;
  setActiveOrder: (order: Order | null) => void;
  addOrder: (order: Order) => void;
  updateOrder: (updatedOrder: Order) => void;
  printOrder: (orderId: string) => Promise<boolean>;
  printBill: (orderId: string) => Promise<boolean>;
  changeOrderStatus: (orderId: string, status: Order["status"]) => void;
  getOrderById: (orderId: string) => Order | undefined;
  pendingOrders: Order[];
  preparingOrders: Order[];
  readyOrders: Order[];
  completedOrders: Order[];
  removeOrdersBeforeDate: (date: Date) => void;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Load orders from localStorage on initial render
  useEffect(() => {
    const savedOrders = localStorage.getItem("restaurantOrders");
    if (savedOrders) {
      try {
        const parsedOrders = JSON.parse(savedOrders).map((order: any) => ({
          ...order,
          createdAt: new Date(order.createdAt),
          updatedAt: new Date(order.updatedAt)
        }));
        setOrders(parsedOrders);
      } catch (error) {
        console.error("Failed to parse saved orders", error);
      }
    }
  }, []);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem("restaurantOrders", JSON.stringify(orders));
    }
  }, [orders]);

  const addOrder = (order: Order) => {
    setOrders(prevOrders => [order, ...prevOrders]);
    toast({
      title: "Order Created",
      description: `Order #${order.id.slice(0, 8)} ${order.isTakeAway ? '(Take Away)' : `for Table ${order.tableNumber}`} has been created.`,
    });
  };

  const updateOrder = (updatedOrder: Order) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === updatedOrder.id ? updatedOrder : order
      )
    );
    
    // If the active order is being updated, update it as well
    if (activeOrder && activeOrder.id === updatedOrder.id) {
      setActiveOrder(updatedOrder);
    }
  };

  const printOrder = async (orderId: string): Promise<boolean> => {
    const orderToPrint = orders.find(o => o.id === orderId);
    if (!orderToPrint) return false;
    
    try {
      // Generate printable content
      const orderContent = generatePrintableOrder(orderToPrint);
      
      // Print to kitchen printer
      const result = await printDocument(orderContent, "kitchen");
      
      if (result.success) {
        // Mark order as printed
        const printedOrder = markOrderAsPrinted(orderToPrint);
        updateOrder(printedOrder);
        
        toast({
          title: "Order Sent to Printer",
          description: `Order #${orderId.slice(0, 8)} has been sent to the kitchen printer.`,
        });
        
        return true;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error printing order:", error);
      
      toast({
        title: "Print Failed",
        description: error instanceof Error ? error.message : "Failed to print order",
        variant: "destructive",
      });
      
      return false;
    }
  };

  const printBill = async (orderId: string): Promise<boolean> => {
    const orderToPrint = orders.find(o => o.id === orderId);
    if (!orderToPrint) return false;
    
    try {
      // Calculate totals
      const subtotal = calculateOrderTotal(orderToPrint);
      const gst = subtotal * 0.05; // 5% GST
      const total = subtotal + gst;
      
      // Generate bill content
      let billContent = `
JAYESH MACHHI KHANAVAL
------------------------------
BILL RECEIPT
Invoice #: ${orderId.slice(0, 8)}
Table: ${orderToPrint.tableNumber}
Date: ${new Date(orderToPrint.createdAt).toLocaleDateString()}
Time: ${new Date(orderToPrint.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
${orderToPrint.isTakeAway ? "*** TAKE AWAY ***" : ""}
------------------------------
ITEM                QTY   AMOUNT
------------------------------
`;

      // Add items
      orderToPrint.items.forEach(item => {
        const menuItem = getMenuItemById(item.menuItemId);
        if (menuItem) {
          const itemName = menuItem.nameEn.slice(0, 16).padEnd(16);
          const itemTotal = menuItem.price * item.quantity;
          billContent += `${itemName} ${item.quantity.toString().padStart(3)}   ${formatCurrency(itemTotal)}\n`;
        }
      });

      billContent += `
------------------------------
Subtotal:           ${formatCurrency(subtotal)}
GST (5%):           ${formatCurrency(gst)}
------------------------------
TOTAL:              ${formatCurrency(total)}

Thank you for dining with us!
Please visit again.
`;

      // Print to billing printer
      const result = await printDocument(billContent, "billing");
      
      if (result.success) {
        toast({
          title: "Bill Printed",
          description: `Bill for Table ${orderToPrint.tableNumber} has been sent to the printer.`,
        });
        
        return true;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error printing bill:", error);
      
      toast({
        title: "Print Failed",
        description: error instanceof Error ? error.message : "Failed to print bill",
        variant: "destructive",
      });
      
      return false;
    }
  };

  const changeOrderStatus = (orderId: string, status: Order["status"]) => {
    const orderToUpdate = orders.find(o => o.id === orderId);
    if (!orderToUpdate) return;
    
    const updatedOrder = updateOrderStatus(orderToUpdate, status);
    updateOrder(updatedOrder);
    
    // If order is marked as completed, update inventory
    if (status === "completed" && orderToUpdate.status !== "completed") {
      // Get current inventory
      const inventoryItems = getInventoryItems();
      // Update inventory based on order items
      const updatedInventory = updateInventoryFromOrder(updatedOrder, inventoryItems);
      // Save updated inventory
      saveInventoryItems(updatedInventory);
      
      // Save order analytics
      saveOrderAnalytics(updatedOrder);
      
      toast({
        title: "Inventory Updated",
        description: "Inventory quantities have been updated based on this order.",
      });
    }
    
    toast({
      title: "Status Updated",
      description: `Order #${orderId.slice(0, 8)} is now ${status}.`,
    });
  };

  const getOrderById = (orderId: string) => {
    return orders.find(order => order.id === orderId);
  };
  
  // Remove orders before a specific date (for billing statement removal)
  const removeOrdersBeforeDate = (date: Date) => {
    const filteredOrders = orders.filter(order => 
      new Date(order.createdAt) >= date
    );
    
    const removedCount = orders.length - filteredOrders.length;
    setOrders(filteredOrders);
    
    toast({
      title: "Orders Removed",
      description: `${removedCount} orders before ${date.toLocaleDateString()} have been removed.`,
    });
  };

  // Filtered orders by status
  const pendingOrders = orders.filter(order => order.status === "pending");
  const preparingOrders = orders.filter(order => order.status === "preparing");
  const readyOrders = orders.filter(order => order.status === "ready");
  const completedOrders = orders.filter(order => 
    order.status === "served" || order.status === "completed"
  );

  return (
    <OrdersContext.Provider
      value={{
        orders,
        activeOrder,
        setActiveOrder,
        addOrder,
        updateOrder,
        printOrder,
        printBill,
        changeOrderStatus,
        getOrderById,
        pendingOrders,
        preparingOrders,
        readyOrders,
        completedOrders,
        removeOrdersBeforeDate
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = (): OrdersContextType => {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrdersProvider");
  }
  return context;
};
