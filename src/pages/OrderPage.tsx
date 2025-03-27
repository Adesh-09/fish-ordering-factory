
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOrders } from "@/hooks/useOrders";
import {
  Order,
  OrderItem,
  createOrder,
  addItemToOrder,
  removeItemFromOrder,
  updateItemQuantity,
} from "@/utils/orderUtils";
import { menuCategories, MenuItem } from "@/utils/menuData";
import MenuCard from "@/components/MenuCard";
import OrderItemComponent from "@/components/OrderItem";
import OrderSummary from "@/components/OrderSummary";
import Header from "@/components/Header";
import { toast } from "@/components/ui/use-toast";

const OrderPage = () => {
  const { addOrder, printOrder, changeOrderStatus } = useOrders();
  const [activeCategory, setActiveCategory] = useState(menuCategories[0].id);
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [tableNumber, setTableNumber] = useState(1);
  const [orderNotes, setOrderNotes] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [showOrderPreview, setShowOrderPreview] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  
  const handleSelectItem = (item: MenuItem) => {
    const existingItemIndex = selectedItems.findIndex(
      selectedItem => selectedItem.menuItemId === item.id
    );
    
    if (existingItemIndex >= 0) {
      // Item already in order, increase quantity
      const updatedItems = [...selectedItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + 1,
      };
      setSelectedItems(updatedItems);
    } else {
      // Add new item
      setSelectedItems([
        ...selectedItems,
        {
          id: `item-${Date.now()}`,
          menuItemId: item.id,
          quantity: 1,
        },
      ]);
    }
    
    toast({
      title: "Item Added",
      description: `${item.nameEn} has been added to the order.`,
    });
  };
  
  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(id);
      return;
    }
    
    setSelectedItems(
      selectedItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };
  
  const handleRemoveItem = (id: string) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id));
  };
  
  const handleAddNote = (id: string, note: string) => {
    setSelectedItems(
      selectedItems.map(item => 
        item.id === id ? { ...item, notes: note } : item
      )
    );
  };
  
  const handleCreateOrder = () => {
    if (selectedItems.length === 0) {
      toast({
        title: "Cannot Create Order",
        description: "Please add at least one item to the order.",
        variant: "destructive",
      });
      return;
    }
    
    const newOrder = createOrder(
      tableNumber,
      selectedItems,
      customerName || undefined,
      orderNotes || undefined
    );
    
    setCreatedOrder(newOrder);
    setShowOrderPreview(true);
  };
  
  const handleConfirmOrder = () => {
    if (createdOrder) {
      addOrder(createdOrder);
      printOrder(createdOrder.id);
      
      // Reset form
      setSelectedItems([]);
      setOrderNotes("");
      setCustomerName("");
      setShowOrderPreview(false);
      setCreatedOrder(null);
      
      toast({
        title: "Order Placed Successfully",
        description: `Order for Table ${tableNumber} has been placed.`,
      });
    }
  };
  
  const activeItems = menuCategories.find(
    category => category.id === activeCategory
  )?.items || [];
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="pt-20 pb-10 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column - Menu Selection */}
          <div className="w-full md:w-2/3">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                New Order - Table {tableNumber}
              </h2>
              
              <div className="mb-4 flex items-center space-x-2">
                <label htmlFor="tableNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Table:
                </label>
                <select
                  id="tableNumber"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(Number(e.target.value))}
                  className="py-2 px-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white"
                >
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
                
                <label htmlFor="customerName" className="ml-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Customer:
                </label>
                <input
                  id="customerName"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Optional"
                  className="py-2 px-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white flex-1"
                />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              {/* Categories Tabs */}
              <div className="overflow-x-auto hide-scrollbar">
                <div className="flex p-2 space-x-2 border-b border-gray-200 dark:border-gray-700">
                  {menuCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                        activeCategory === category.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      {category.nameEn}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Menu Items Grid */}
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="wait">
                  {activeItems.map((item) => {
                    const isSelected = selectedItems.some(
                      selectedItem => selectedItem.menuItemId === item.id
                    );
                    
                    return (
                      <MenuCard
                        key={item.id}
                        item={item}
                        isSelected={isSelected}
                        onSelect={handleSelectItem}
                      />
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </div>
          
          {/* Right Column - Order Summary */}
          <div className="w-full md:w-1/3">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Order Summary
              </h2>
              
              {selectedItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No items added yet.</p>
                  <p className="text-sm mt-2">Select items from the menu to add them to the order.</p>
                </div>
              ) : (
                <div className="mb-4 max-h-[400px] overflow-y-auto">
                  {selectedItems.map((item) => (
                    <OrderItemComponent
                      key={item.id}
                      item={item}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemove={handleRemoveItem}
                      onAddNote={handleAddNote}
                    />
                  ))}
                </div>
              )}
              
              <div className="mt-4">
                <label htmlFor="orderNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Order Notes (Optional)
                </label>
                <textarea
                  id="orderNotes"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Add any special instructions for the entire order..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700 min-h-[80px]"
                />
              </div>
              
              <div className="mt-6">
                <button
                  onClick={handleCreateOrder}
                  disabled={selectedItems.length === 0}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Order Preview Modal */}
      <AnimatePresence>
        {showOrderPreview && createdOrder && (
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
                    Order Preview
                  </h2>
                  
                  <OrderSummary
                    order={createdOrder}
                    onPrint={handleConfirmOrder}
                    onChangeStatus={(status) => {
                      changeOrderStatus(createdOrder.id, status);
                    }}
                    onClose={() => setShowOrderPreview(false)}
                  />
                  
                  <div className="mt-4 flex space-x-3">
                    <button
                      onClick={() => setShowOrderPreview(false)}
                      className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 font-medium rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    
                    <button
                      onClick={handleConfirmOrder}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Confirm &amp; Print
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderPage;
