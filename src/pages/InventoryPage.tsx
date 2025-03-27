
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Fish, Bottle, Box, FileText, FilePlus, FileMinus } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import PasswordModal from "@/components/PasswordModal";

// Inventory types
const inventoryCategories = [
  { id: "flour", name: "Flour", icon: <Box className="h-5 w-5" /> },
  { id: "fish", name: "Fish", icon: <Fish className="h-5 w-5" /> },
  { id: "beverages", name: "Beverages", icon: <Bottle className="h-5 w-5" /> },
  { id: "other", name: "Other Items", icon: <FileText className="h-5 w-5" /> }
];

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  lastUpdated: Date;
  minLevel: number;
  costPrice: number;
}

// Initial dummy inventory data
const initialInventory: InventoryItem[] = [
  {
    id: "1",
    name: "Bajri Aata",
    category: "flour",
    quantity: 25,
    unit: "kg",
    lastUpdated: new Date(),
    minLevel: 5,
    costPrice: 45
  },
  {
    id: "2",
    name: "Surmai Fish",
    category: "fish",
    quantity: 15,
    unit: "kg",
    lastUpdated: new Date(),
    minLevel: 3,
    costPrice: 550
  },
  {
    id: "3",
    name: "Bangda Fish",
    category: "fish",
    quantity: 20,
    unit: "kg",
    lastUpdated: new Date(),
    minLevel: 4,
    costPrice: 250
  },
  {
    id: "4",
    name: "Paplet Fish",
    category: "fish",
    quantity: 10,
    unit: "kg",
    lastUpdated: new Date(),
    minLevel: 2,
    costPrice: 650
  },
  {
    id: "5",
    name: "Chilapi Fish",
    category: "fish",
    quantity: 8,
    unit: "kg",
    lastUpdated: new Date(),
    minLevel: 2,
    costPrice: 300
  },
  {
    id: "6",
    name: "Thums Up",
    category: "beverages",
    quantity: 48,
    unit: "bottles",
    lastUpdated: new Date(),
    minLevel: 10,
    costPrice: 15
  },
  {
    id: "7",
    name: "Sprite",
    category: "beverages",
    quantity: 36,
    unit: "bottles",
    lastUpdated: new Date(),
    minLevel: 10,
    costPrice: 15
  },
  {
    id: "8",
    name: "Water Bottles",
    category: "beverages",
    quantity: 100,
    unit: "bottles",
    lastUpdated: new Date(),
    minLevel: 20,
    costPrice: 10
  }
];

const InventoryPage = () => {
  const [showPasswordModal, setShowPasswordModal] = useState(true);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [newItem, setNewItem] = useState({
    name: "",
    category: "flour",
    quantity: 0,
    unit: "kg",
    minLevel: 0,
    costPrice: 0
  });
  const [searchQuery, setSearchQuery] = useState("");
  
  const navigate = useNavigate();
  const { orders } = useOrders();
  
  // Filter inventory by category and search query
  const filteredInventory = inventory.filter(item => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  // Check for low stock items
  const lowStockItems = inventory.filter(item => item.quantity <= item.minLevel);
  
  // Add new inventory item
  const handleAddItem = () => {
    if (!newItem.name || newItem.quantity <= 0) {
      toast({
        title: "Invalid Entry",
        description: "Please provide a name and valid quantity.",
        variant: "destructive"
      });
      return;
    }
    
    const newInventoryItem: InventoryItem = {
      id: Date.now().toString(),
      name: newItem.name,
      category: newItem.category,
      quantity: newItem.quantity,
      unit: newItem.unit,
      lastUpdated: new Date(),
      minLevel: newItem.minLevel || 1,
      costPrice: newItem.costPrice || 0
    };
    
    setInventory([...inventory, newInventoryItem]);
    setNewItem({
      name: "",
      category: "flour",
      quantity: 0,
      unit: "kg",
      minLevel: 0,
      costPrice: 0
    });
    
    toast({
      title: "Item Added",
      description: `${newItem.name} has been added to inventory.`,
    });
  };
  
  // Update inventory item quantity
  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    
    setInventory(inventory.map(item => 
      item.id === id 
        ? { ...item, quantity: newQuantity, lastUpdated: new Date() } 
        : item
    ));
  };
  
  // Delete inventory item
  const handleDeleteItem = (id: string) => {
    setInventory(inventory.filter(item => item.id !== id));
    toast({
      title: "Item Deleted",
      description: "The inventory item has been removed.",
    });
  };
  
  if (showPasswordModal) {
    return (
      <PasswordModal
        onSuccess={() => setShowPasswordModal(false)}
        onCancel={() => navigate(-1)}
        title="Inventory Access"
      />
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="pt-20 pb-10 px-4 max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
              <p className="text-gray-600 dark:text-gray-300">
                Track and manage restaurant inventory
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex space-x-2">
              <Input
                type="text"
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64"
              />
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <FilePlus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Inventory Item</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="text-sm font-medium">Item Name</label>
                        <Input 
                          placeholder="Item name"
                          value={newItem.name}
                          onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Category</label>
                        <select 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                          value={newItem.category}
                          onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                        >
                          {inventoryCategories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Unit</label>
                        <select 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                          value={newItem.unit}
                          onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                        >
                          <option value="kg">Kilogram (kg)</option>
                          <option value="g">Gram (g)</option>
                          <option value="l">Liter (l)</option>
                          <option value="ml">Milliliter (ml)</option>
                          <option value="bottles">Bottles</option>
                          <option value="packages">Packages</option>
                          <option value="items">Items</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Quantity</label>
                        <Input 
                          type="number"
                          placeholder="Quantity"
                          value={newItem.quantity || ""}
                          onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Minimum Level</label>
                        <Input 
                          type="number"
                          placeholder="Min level"
                          value={newItem.minLevel || ""}
                          onChange={(e) => setNewItem({...newItem, minLevel: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Cost Price (₹)</label>
                        <Input 
                          type="number"
                          placeholder="Cost price"
                          value={newItem.costPrice || ""}
                          onChange={(e) => setNewItem({...newItem, costPrice: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <Button className="w-full" onClick={handleAddItem}>
                          Add Item to Inventory
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
        
        {lowStockItems.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 rounded-xl p-4 mb-6">
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
              Low Stock Alert
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {lowStockItems.map(item => (
                <div 
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-red-200 dark:border-red-900/30 flex justify-between items-center"
                >
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <div className="text-sm text-red-600 dark:text-red-400">
                      Only {item.quantity} {item.unit} left!
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // Open a dialog for restocking in a real app
                      toast({
                        title: "Restock Reminder",
                        description: `Please restock ${item.name} soon.`
                      });
                    }}
                  >
                    Restock
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <Tabs defaultValue="all" onValueChange={setSelectedCategory}>
          <TabsList className="mb-6 bg-white dark:bg-gray-800 p-1 overflow-x-auto flex-nowrap">
            <TabsTrigger value="all">All Items</TabsTrigger>
            {inventoryCategories.map(category => (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center">
                <span className="mr-1">{category.icon}</span>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Cost Price</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No inventory items found. Add some items to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInventory.map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>
                            {inventoryCategories.find(cat => cat.id === item.category)?.name || item.category}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              >
                                -
                              </Button>
                              <span className={`${item.quantity <= item.minLevel ? 'text-red-600 dark:text-red-400 font-medium' : ''}`}>
                                {item.quantity} {item.unit}
                              </span>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              >
                                +
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-500 dark:text-gray-400 text-sm">
                            {item.lastUpdated.toLocaleDateString()}
                          </TableCell>
                          <TableCell>₹{item.costPrice}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // In a full app, this would open an edit dialog
                                  toast({
                                    title: "Edit Item",
                                    description: "This would open an edit dialog in a complete app."
                                  });
                                }}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                <FileMinus className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
          
          {inventoryCategories.map(category => (
            <TabsContent key={category.id} value={category.id} className="mt-0">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead>Cost Price</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInventory.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            No items found in this category.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredInventory.map(item => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  className="h-6 w-6"
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                >
                                  -
                                </Button>
                                <span className={`${item.quantity <= item.minLevel ? 'text-red-600 dark:text-red-400 font-medium' : ''}`}>
                                  {item.quantity} {item.unit}
                                </span>
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  className="h-6 w-6"
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                >
                                  +
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-500 dark:text-gray-400 text-sm">
                              {item.lastUpdated.toLocaleDateString()}
                            </TableCell>
                            <TableCell>₹{item.costPrice}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    // In a full app, this would open an edit dialog
                                    toast({
                                      title: "Edit Item",
                                      description: "This would open an edit dialog in a complete app."
                                    });
                                  }}
                                >
                                  Edit
                                </Button>
                                <Button 
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteItem(item.id)}
                                >
                                  <FileMinus className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
};

export default InventoryPage;
