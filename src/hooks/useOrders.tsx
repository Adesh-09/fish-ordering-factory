
import React, { createContext, useContext, useState, useEffect } from "react";
import { Order, createOrder, calculateOrderTotal, updateOrderStatus, markOrderAsPrinted } from "@/utils/orderUtils";
import { toast } from "@/components/ui/use-toast";

interface OrdersContextType {
  orders: Order[];
  activeOrder: Order | null;
  setActiveOrder: (order: Order | null) => void;
  addOrder: (order: Order) => void;
  updateOrder: (updatedOrder: Order) => void;
  printOrder: (orderId: string) => void;
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
      description: `Order #${order.id.slice(0, 8)} for Table ${order.tableNumber} has been created.`,
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

  const printOrder = (orderId: string) => {
    const orderToPrint = orders.find(o => o.id === orderId);
    if (!orderToPrint) return;
    
    // In a real app, this would trigger printing functionality
    // For now, we'll just mark it as printed
    const printedOrder = markOrderAsPrinted(orderToPrint);
    updateOrder(printedOrder);
    
    toast({
      title: "Order Sent to Printer",
      description: `Order #${orderId.slice(0, 8)} has been sent to the kitchen printer.`,
    });
  };

  const changeOrderStatus = (orderId: string, status: Order["status"]) => {
    const orderToUpdate = orders.find(o => o.id === orderId);
    if (!orderToUpdate) return;
    
    const updatedOrder = updateOrderStatus(orderToUpdate, status);
    updateOrder(updatedOrder);
    
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
