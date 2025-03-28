export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  lastUpdated: Date;
  minLevel: number;
  costPrice: number;
  inStock: boolean;
}

export interface InventoryCategory {
  id: string;
  name: string;
  description?: string;
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  type: 'add' | 'remove' | 'adjust';
  quantity: number;
  date: Date;
  notes?: string;
  userId?: string;
  orderId?: string;
}

// Initial inventory categories
export const inventoryCategories: InventoryCategory[] = [
  { id: "flour", name: "Flour", description: "Different types of flour and grains" },
  { id: "fish", name: "Fish", description: "Fresh fish varieties" },
  { id: "beverages", name: "Beverages", description: "Drinks and beverages" },
  { id: "spices", name: "Spices", description: "Spices and seasonings" },
  { id: "vegetables", name: "Vegetables", description: "Fresh vegetables" },
  { id: "other", name: "Other Items", description: "Miscellaneous items" }
];

// Storage keys
const INVENTORY_STORAGE_KEY = "restaurant_inventory";
const INVENTORY_TRANSACTIONS_KEY = "inventory_transactions";

// Generate a unique ID
export const generateInventoryId = (): string => {
  return "inv_" + Math.random().toString(36).substring(2, 15);
};

// Get inventory data
export const getInventoryItems = (): InventoryItem[] => {
  const data = localStorage.getItem(INVENTORY_STORAGE_KEY);
  if (!data) return [];
  
  try {
    const items = JSON.parse(data);
    return items.map((item: any) => ({
      ...item,
      lastUpdated: new Date(item.lastUpdated)
    }));
  } catch (e) {
    console.error("Error parsing inventory data", e);
    return [];
  }
};

// Save inventory data
export const saveInventoryItems = (items: InventoryItem[]): void => {
  localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items));
};

// Add inventory item
export const addInventoryItem = (
  items: InventoryItem[],
  name: string,
  category: string,
  quantity: number,
  unit: string,
  minLevel: number = 1,
  costPrice: number = 0
): InventoryItem[] => {
  const newItem: InventoryItem = {
    id: generateInventoryId(),
    name,
    category,
    quantity,
    unit,
    lastUpdated: new Date(),
    minLevel,
    costPrice,
    inStock: quantity > 0
  };
  
  const updatedItems = [...items, newItem];
  saveInventoryItems(updatedItems);
  return updatedItems;
};

// Update inventory quantity
export const updateInventoryQuantity = (
  items: InventoryItem[],
  itemId: string,
  newQuantity: number,
  orderId?: string
): InventoryItem[] => {
  const itemIndex = items.findIndex(item => item.id === itemId);
  if (itemIndex === -1) return items;
  
  const currentItem = items[itemIndex];
  const quantityDifference = newQuantity - currentItem.quantity;
  
  // Record transaction
  const transaction: InventoryTransaction = {
    id: "trx_" + Math.random().toString(36).substring(2, 15),
    itemId,
    type: quantityDifference > 0 ? 'add' : 'remove',
    quantity: Math.abs(quantityDifference),
    date: new Date(),
    notes: orderId ? `Order: ${orderId}` : "Manual adjustment",
    orderId
  };
  
  recordTransaction(transaction);
  
  // Update item
  const updatedItems = [...items];
  updatedItems[itemIndex] = { 
    ...currentItem, 
    quantity: newQuantity, 
    lastUpdated: new Date(),
    inStock: newQuantity > 0 
  };
  
  saveInventoryItems(updatedItems);
  return updatedItems;
};

// Remove inventory item
export const removeInventoryItem = (
  items: InventoryItem[],
  itemId: string
): InventoryItem[] => {
  const updatedItems = items.filter(item => item.id !== itemId);
  saveInventoryItems(updatedItems);
  return updatedItems;
};

// Get low stock items
export const getLowStockItems = (items: InventoryItem[]): InventoryItem[] => {
  return items.filter(item => item.quantity <= item.minLevel);
};

// Get transactions
export const getInventoryTransactions = (): InventoryTransaction[] => {
  const data = localStorage.getItem(INVENTORY_TRANSACTIONS_KEY);
  if (!data) return [];
  
  try {
    const transactions = JSON.parse(data);
    return transactions.map((tx: any) => ({
      ...tx,
      date: new Date(tx.date)
    }));
  } catch (e) {
    console.error("Error parsing inventory transactions", e);
    return [];
  }
};

// Record inventory transaction
export const recordTransaction = (transaction: InventoryTransaction): void => {
  const transactions = getInventoryTransactions();
  const updatedTransactions = [...transactions, transaction];
  
  // Save transactions, keeping only the last 1000 to prevent localStorage issues
  const limitedTransactions = updatedTransactions.slice(-1000);
  localStorage.setItem(INVENTORY_TRANSACTIONS_KEY, JSON.stringify(limitedTransactions));
};

// Record inventory transaction and return updated list
export const recordInventoryTransaction = (
  transactions: InventoryTransaction[],
  itemId: string,
  type: 'add' | 'remove' | 'adjust',
  quantity: number,
  notes?: string,
  userId?: string,
  orderId?: string
): InventoryTransaction[] => {
  const newTransaction: InventoryTransaction = {
    id: "trx_" + Math.random().toString(36).substring(2, 15),
    itemId,
    type,
    quantity,
    date: new Date(),
    notes,
    userId,
    orderId
  };
  
  recordTransaction(newTransaction);
  return [...transactions, newTransaction];
};

// Get inventory value
export const calculateInventoryValue = (items: InventoryItem[]): number => {
  return items.reduce((total, item) => total + (item.quantity * item.costPrice), 0);
};

// Get monthly transactions
export const getMonthlyTransactions = (month: Date): InventoryTransaction[] => {
  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59);
  
  const transactions = getInventoryTransactions();
  return transactions.filter(tx => 
    tx.date >= startOfMonth && tx.date <= endOfMonth
  );
};

// Print inventory transactions
export const printInventoryTransactions = async (
  month: Date, 
  printFunction: (content: string) => Promise<boolean>
): Promise<boolean> => {
  const transactions = getMonthlyTransactions(month);
  const items = getInventoryItems();
  
  let printContent = `
    JAYESH MACHHI KHANAVAL
    ------------------------------
    INVENTORY TRANSACTIONS
    ${month.toLocaleString('default', { month: 'long', year: 'numeric' })}
    ------------------------------
    
    Date       Item                Type      Qty    
    ------------------------------
  `;
  
  transactions.forEach(tx => {
    const item = items.find(i => i.id === tx.itemId);
    const itemName = item ? item.name : "Unknown Item";
    const date = tx.date.toLocaleDateString('en-US', {day: '2-digit', month: '2-digit'});
    
    printContent += `
    ${date.padEnd(10)}${itemName.substring(0, 18).padEnd(20)}${tx.type.padEnd(10)}${tx.quantity}
    `;
  });
  
  printContent += `
    ------------------------------
    Total Transactions: ${transactions.length}
    ------------------------------
  `;
  
  return await printFunction(printContent);
};
