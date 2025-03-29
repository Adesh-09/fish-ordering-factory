
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOrders } from "@/hooks/useOrders";
import OrderSummary from "@/components/OrderSummary";
import BillPreview from "@/components/BillPreview";
import Header from "@/components/Header";
import PrintButton from "@/components/PrintButton";
import { formatCurrency, Order } from "@/utils/orderUtils";
import { getMenuItemById } from "@/utils/menuData";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarX, Printer, Lock, Search, ClipboardList } from "lucide-react";
import PasswordModal from "@/components/PasswordModal";

const BillingSystemContent = () => {
  const { orders, printOrder, printBill, changeOrderStatus, removeOrdersBeforeDate } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showBillPreview, setShowBillPreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteMonth, setDeleteMonth] = useState<Date>(new Date());
  
  const filteredOrders = orders
    .filter((order) => order.status !== "cancelled")
    .filter((order) => {
      if (!searchQuery) return true;
      
      const orderIdMatch = order.id.toLowerCase().includes(searchQuery.toLowerCase());
      const tableMatch = order.tableNumber.toString().includes(searchQuery);
      const customerMatch = order.customerName?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return orderIdMatch || tableMatch || customerMatch;
    });
  
  const pendingOrders = filteredOrders.filter((order) => order.status === "pending");
  const preparingOrders = filteredOrders.filter((order) => order.status === "preparing");
  const readyOrders = filteredOrders.filter((order) => order.status === "ready" || order.status === "served");
  const completedOrders = filteredOrders.filter((order) => order.status === "completed");
  
  const handleGenerateBill = (order: Order) => {
    setSelectedOrder(order);
    setShowBillPreview(true);
  };
  
  const handlePrintBill = async () => {
    if (selectedOrder) {
      const success = await printBill(selectedOrder.id);
      
      if (success) {
        changeOrderStatus(selectedOrder.id, "completed");
        setShowBillPreview(false);
      }
    }
  };
  
  const handleDeleteOrdersForMonth = () => {
    const startOfMonth = new Date(deleteMonth.getFullYear(), deleteMonth.getMonth(), 1);
    const endOfMonth = new Date(deleteMonth.getFullYear(), deleteMonth.getMonth() + 1, 0);
    
    removeOrdersBeforeDate(endOfMonth);
    
    setShowDeleteConfirm(false);
    
    toast({
      title: "Bill Statements Removed",
      description: `All bills for ${deleteMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} have been removed.`,
    });
  };
  
  if (showPasswordModal) {
    return (
      <PasswordModal 
        onSuccess={() => setShowPasswordModal(false)}
        onCancel={() => setShowPasswordModal(false)}
      />
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="pt-20 pb-10 px-4 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing System</h1>
              <p className="text-gray-600 dark:text-gray-300">
                Generate and print bills for completed orders.
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-auto pl-9 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              
              <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <DialogTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="destructive">
                      <CalendarX className="h-4 w-4 mr-2" />
                      Remove Bills
                    </Button>
                  </motion.div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Remove Bill Statements</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="mb-6 text-gray-600 dark:text-gray-300">
                      Select a month to remove all bill statements for that period. This action cannot be undone.
                    </p>
                    
                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-2">Select Month</label>
                      <input
                        type="month"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        value={`${deleteMonth.getFullYear()}-${String(deleteMonth.getMonth() + 1).padStart(2, '0')}`}
                        onChange={(e) => {
                          const [year, month] = e.target.value.split('-').map(Number);
                          setDeleteMonth(new Date(year, month - 1));
                        }}
                      />
                    </div>
                    
                    <div className="flex space-x-3">
                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1">
                        <Button
                          variant="outline"
                          onClick={() => setShowDeleteConfirm(false)}
                          className="w-full"
                        >
                          Cancel
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1">
                        <Button
                          variant="destructive"
                          onClick={handleDeleteOrdersForMonth}
                          className="w-full"
                        >
                          Remove Bills
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center space-x-2 mb-4">
              <ClipboardList className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Active Orders
              </h2>
            </div>
            
            {pendingOrders.length === 0 && preparingOrders.length === 0 && readyOrders.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center">
                <p className="text-gray-600 dark:text-gray-300">No active orders at the moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {[...readyOrders, ...preparingOrders, ...pendingOrders].map((order, index) => (
                  <motion.div 
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
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
                            const menuItem = getMenuItemById(item.menuItemId);
                            return total + (menuItem ? (menuItem.price * item.quantity) : 0);
                          }, 0))}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex space-x-2 justify-end">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                          View Details
                        </button>
                      </motion.div>
                      
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <button
                          onClick={() => handleGenerateBill(order)}
                          className="px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center"
                        >
                          <Printer className="h-4 w-4 mr-1" />
                          Generate Bill
                        </button>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center space-x-2 mb-4">
              <ClipboardList className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Completed Orders
              </h2>
            </div>
            
            {completedOrders.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center">
                <p className="text-gray-600 dark:text-gray-300">No completed orders yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedOrders.map((order, index) => (
                  <motion.div 
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + (index * 0.05) }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700 opacity-80 hover:opacity-100 hover:shadow-md transition-all"
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
                            const menuItem = getMenuItemById(item.menuItemId);
                            return total + (menuItem ? (menuItem.price * item.quantity) : 0);
                          }, 0))}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex space-x-2 justify-end">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                          View Details
                        </button>
                      </motion.div>
                      
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowBillPreview(true);
                          }}
                          className="px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-400 text-white hover:bg-gray-500 transition-colors flex items-center"
                        >
                          <Printer className="h-4 w-4 mr-1" />
                          Reprint Bill
                        </button>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>
      
      <AnimatePresence>
        {selectedOrder && !showBillPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={(e) => {
              // Close modal when clicking backdrop
              if (e.target === e.currentTarget) {
                setSelectedOrder(null);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
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
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 font-medium rounded-lg transition-colors"
                      >
                        Close
                      </button>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                      <button
                        onClick={() => {
                          setShowBillPreview(true);
                        }}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Generate Bill
                      </button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {selectedOrder && showBillPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={(e) => {
              // Close modal when clicking backdrop
              if (e.target === e.currentTarget) {
                setShowBillPreview(false);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <BillPreview
                order={selectedOrder}
                onPrint={handlePrintBill}
              />
              
              <div className="mt-4 flex justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <button
                    onClick={() => setShowBillPreview(false)}
                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 font-medium rounded-lg transition-colors"
                  >
                    Back
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <PrintButton />
    </div>
  );
};

const BillingSystem = () => (
  <BillingSystemContent />
);

export default BillingSystem;
