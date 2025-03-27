
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { OrdersProvider, useOrders } from "@/hooks/useOrders";
import KitchenOrderCard from "@/components/KitchenOrderCard";
import Header from "@/components/Header";

const KitchenDisplayContent = () => {
  const { pendingOrders, preparingOrders, readyOrders, changeOrderStatus } = useOrders();
  const [activeTab, setActiveTab] = useState<"pending" | "preparing" | "ready">("pending");
  
  const tabs = [
    { id: "pending", label: "Pending", count: pendingOrders.length },
    { id: "preparing", label: "Preparing", count: preparingOrders.length },
    { id: "ready", label: "Ready", count: readyOrders.length },
  ];
  
  const getOrdersForCurrentTab = () => {
    switch (activeTab) {
      case "pending":
        return pendingOrders;
      case "preparing":
        return preparingOrders;
      case "ready":
        return readyOrders;
      default:
        return [];
    }
  };
  
  const currentOrders = getOrdersForCurrentTab();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="pt-20 pb-10 px-4 max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kitchen Display System</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage and track orders in real-time to streamline kitchen operations.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative px-6 py-4 text-sm font-medium ${
                  activeTab === tab.id
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                {tab.label} 
                {tab.count > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs dark:bg-blue-900/30 dark:text-blue-400">
                    {tab.count}
                  </span>
                )}
                
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {currentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  No {activeTab} orders
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  {activeTab === "pending"
                    ? "When new orders arrive, they will appear here."
                    : activeTab === "preparing"
                    ? "No orders are currently being prepared."
                    : "No orders are ready for serving."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentOrders.map((order) => (
                  <KitchenOrderCard 
                    key={order.id} 
                    order={order} 
                    onStatusChange={changeOrderStatus} 
                  />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

// Wrap with OrdersProvider
const KitchenDisplay = () => (
  <OrdersProvider>
    <KitchenDisplayContent />
  </OrdersProvider>
);

export default KitchenDisplay;
