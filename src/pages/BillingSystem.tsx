
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { OrdersProvider, useOrders } from "@/hooks/useOrders";
import OrderSummary from "@/components/OrderSummary";
import BillPreview from "@/components/BillPreview";
import Header from "@/components/Header";
import { formatCurrency, Order } from "@/utils/orderUtils";
import { toast } from "@/components/ui/use-toast";

const BillingSystemContent = () => {
  const { orders, printOrder, changeOrderStatus } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showBillPreview, setShowBillPreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter orders - exclude cancelled orders and filter by search query if present
  const filteredOrders = orders
    .filter((order) => order.status !== "cancelled")
    .filter((order) => {
      if (!searchQuery) return true;
      
      const orderIdMatch = order.id.toLowerCase().includes(searchQuery.toLowerCase());
      const tableMatch = order.tableNumber.toString().includes(searchQuery);
      const customerMatch = order.customerName?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return orderIdMatch || tableMatch || customerMatch;
    });
  
  // Group orders by status for display
  const pendingOrders = filteredOrders.filter((order) => order.status === "pending");
  const preparingOrders = filteredOrders.filter((order) => order.status === "preparing");
  const readyOrders = filteredOrders.filter((order) => order.status === "ready" || order.status === "served");
  const completedOrders = filteredOrders.filter((order) => order.status === "completed");
  
  const handleGenerateBill = (order: Order) => {
    setSelectedOrder(order);
    setShowBillPreview(true);
  };
  
  const handlePrintBill = () => {
    if (selectedOrder) {
      // In a real app, this would trigger a bill printing functionality
      toast({
        title: "Bill Printed",
        description: `Bill for Table ${selectedOrder.tableNumber} has been sent to the printer.`,
      });
      
      // Mark the order as completed
      changeOrderStatus(selectedOrder.id, "completed");
      setShowBillPreview(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="pt-20 pb-10 px-4 max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing System</h1>
              <p className="text-gray-600 dark:text-gray-300">
                Generate and print bills for completed orders.
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <input
                type="text"
                placeholder="Search by order ID, table, or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-auto px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Orders */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Active Orders
            </h2>
            
            {pendingOrders.length === 0 && preparingOrders.length === 0 && readyOrders.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center">
                <p className="text-gray-600 dark:text-gray-300">No active orders at the moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {[...readyOrders, ...preparingOrders, ...pendingOrders].map((order) => (
                  <div 
                    key={order.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 font-medium">
                          Table {order.tableNumber}
                        </span>
                        <h3 className="text-lg font-medium mt-2 mb-1">Order #{order.id.slice(0, 8)}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {" • "}
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          order.status === "ready" || order.status === "served"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : order.status === "preparing"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <p className="text-lg font-bold mt-2 text-blue-600 dark:text-blue-400">
                          {formatCurrency(order.items.reduce((total, item) => {
                            const menuItem = order.items.find(i => i.id === item.id);
                            return total + (menuItem ? item.quantity * 0 : 0); // This would use actual prices in a real app
                          }, 0))}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex space-x-2 justify-end">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        View Details
                      </button>
                      
                      <button
                        onClick={() => handleGenerateBill(order)}
                        className="px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      >
                        Generate Bill
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Completed Orders */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Completed Orders
            </h2>
            
            {completedOrders.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center">
                <p className="text-gray-600 dark:text-gray-300">No completed orders yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedOrders.map((order) => (
                  <div 
                    key={order.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700 opacity-80"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 font-medium">
                          Table {order.tableNumber}
                        </span>
                        <h3 className="text-lg font-medium mt-2 mb-1">Order #{order.id.slice(0, 8)}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {" • "}
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 font-medium">
                          Completed
                        </span>
                        <p className="text-lg font-bold mt-2 text-blue-600 dark:text-blue-400">
                          {formatCurrency(order.items.reduce((total, item) => {
                            const menuItem = order.items.find(i => i.id === item.id);
                            return total + (menuItem ? item.quantity * 0 : 0); // This would use actual prices in a real app
                          }, 0))}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex space-x-2 justify-end">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        View Details
                      </button>
                      
                      <button
                        onClick={() => handleGenerateBill(order)}
                        className="px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-400 text-white hover:bg-gray-500 transition-colors"
                      >
                        Reprint Bill
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && !showBillPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                    Order Details
                  </h2>
                  
                  <OrderSummary
                    order={selectedOrder}
                    onPrint={() => printOrder(selectedOrder.id)}
                    onChangeStatus={(status) => {
                      changeOrderStatus(selectedOrder.id, status);
                      setSelectedOrder(null);
                    }}
                    onClose={() => setSelectedOrder(null)}
                  />
                  
                  <div className="mt-4 flex space-x-3">
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 font-medium rounded-lg transition-colors"
                    >
                      Close
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowBillPreview(true);
                      }}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Generate Bill
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Bill Preview Modal */}
      <AnimatePresence>
        {selectedOrder && showBillPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full"
            >
              <BillPreview
                order={selectedOrder}
                onPrint={handlePrintBill}
              />
              
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => setShowBillPreview(false)}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 font-medium rounded-lg transition-colors"
                >
                  Back
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Wrap with OrdersProvider
const BillingSystem = () => (
  <OrdersProvider>
    <BillingSystemContent />
  </OrdersProvider>
);

export default BillingSystem;
