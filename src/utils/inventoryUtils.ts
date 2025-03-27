
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

// Generate a unique ID
export const generateInventoryId = (): string => {
  return "inv_" + Math.random().toString(36).substring(2, 15);
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
  
  return [...items, newItem];
};

// Update inventory quantity
export const updateInventoryQuantity = (
  items: InventoryItem[],
  itemId: string,
  newQuantity: number
): InventoryItem[] => {
  return items.map(item => 
    item.id === itemId 
      ? { 
          ...item, 
          quantity: newQuantity, 
          lastUpdated: new Date(),
          inStock: newQuantity > 0 
        } 
      : item
  );
};

// Remove inventory item
export const removeInventoryItem = (
  items: InventoryItem[],
  itemId: string
): InventoryItem[] => {
  return items.filter(item => item.id !== itemId);
};

// Get low stock items
export const getLowStockItems = (items: InventoryItem[]): InventoryItem[] => {
  return items.filter(item => item.quantity <= item.minLevel);
};

// Record inventory transaction
export const recordInventoryTransaction = (
  transactions: InventoryTransaction[],
  itemId: string,
  type: 'add' | 'remove' | 'adjust',
  quantity: number,
  notes?: string,
  userId?: string
): InventoryTransaction[] => {
  const newTransaction: InventoryTransaction = {
    id: "trx_" + Math.random().toString(36).substring(2, 15),
    itemId,
    type,
    quantity,
    date: new Date(),
    notes,
    userId
  };
  
  return [...transactions, newTransaction];
};

// Get inventory value
export const calculateInventoryValue = (items: InventoryItem[]): number => {
  return items.reduce((total, item) => total + (item.quantity * item.costPrice), 0);
};
