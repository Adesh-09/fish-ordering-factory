
import { MenuItem, getMenuItemById } from "./menuData";

export interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  notes?: string;
  customizations?: string[];
}

export interface Order {
  id: string;
  tableNumber: number;
  items: OrderItem[];
  status: "pending" | "preparing" | "ready" | "served" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
  customerName?: string;
  isPrinted: boolean;
}

// Generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Calculate order total
export const calculateOrderTotal = (order: Order): number => {
  return order.items.reduce((total, item) => {
    const menuItem = getMenuItemById(item.menuItemId);
    if (menuItem) {
      return total + (menuItem.price * item.quantity);
    }
    return total;
  }, 0);
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toFixed(2)}`;
};

// Create a new order
export const createOrder = (
  tableNumber: number,
  items: OrderItem[],
  customerName?: string,
  notes?: string
): Order => {
  return {
    id: generateId(),
    tableNumber,
    items,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
    customerName,
    notes,
    isPrinted: false,
  };
};

// Add item to order
export const addItemToOrder = (order: Order, menuItemId: string, quantity: number = 1, notes?: string): Order => {
  const existingItemIndex = order.items.findIndex(item => item.menuItemId === menuItemId);
  
  if (existingItemIndex >= 0) {
    // Update existing item
    const updatedItems = [...order.items];
    updatedItems[existingItemIndex] = {
      ...updatedItems[existingItemIndex],
      quantity: updatedItems[existingItemIndex].quantity + quantity,
      notes: notes || updatedItems[existingItemIndex].notes
    };
    
    return {
      ...order,
      items: updatedItems,
      updatedAt: new Date(),
    };
  } else {
    // Add new item
    return {
      ...order,
      items: [
        ...order.items,
        {
          id: generateId(),
          menuItemId,
          quantity,
          notes
        }
      ],
      updatedAt: new Date(),
    };
  }
};

// Remove item from order
export const removeItemFromOrder = (order: Order, orderItemId: string): Order => {
  return {
    ...order,
    items: order.items.filter(item => item.id !== orderItemId),
    updatedAt: new Date(),
  };
};

// Update item quantity
export const updateItemQuantity = (order: Order, orderItemId: string, quantity: number): Order => {
  if (quantity <= 0) {
    return removeItemFromOrder(order, orderItemId);
  }
  
  return {
    ...order,
    items: order.items.map(item => 
      item.id === orderItemId 
        ? { ...item, quantity } 
        : item
    ),
    updatedAt: new Date(),
  };
};

// Update order status
export const updateOrderStatus = (order: Order, status: Order['status']): Order => {
  return {
    ...order,
    status,
    updatedAt: new Date(),
  };
};

// Mark order as printed
export const markOrderAsPrinted = (order: Order): Order => {
  return {
    ...order,
    isPrinted: true,
    updatedAt: new Date(),
  };
};

// Generate printable order
export const generatePrintableOrder = (order: Order): string => {
  let printContent = `
    JAYESH MACHHI KHANAVAL
    ------------------------------
    Order ID: ${order.id.slice(0, 8)}
    Table: ${order.tableNumber}
    Time: ${order.createdAt.toLocaleTimeString()}
    Date: ${order.createdAt.toLocaleDateString()}
    ------------------------------
    Items:
  `;
  
  order.items.forEach(item => {
    const menuItem = getMenuItemById(item.menuItemId);
    if (menuItem) {
      printContent += `
      ${item.quantity} x ${menuItem.nameEn} (${formatCurrency(menuItem.price)})
      ${item.notes ? `  Note: ${item.notes}` : ''}
      `;
    }
  });
  
  printContent += `
    ------------------------------
    Total: ${formatCurrency(calculateOrderTotal(order))}
    ------------------------------
  `;
  
  if (order.notes) {
    printContent += `
    Order Notes: ${order.notes}
    `;
  }
  
  return printContent;
};

// Format time
export const formatOrderTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Calculate time elapsed since order creation
export const getTimeElapsed = (createdAt: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - createdAt.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) {
    return 'Just now';
  } else if (diffMins === 1) {
    return '1 min ago';
  } else if (diffMins < 60) {
    return `${diffMins} mins ago`;
  } else {
    const hours = Math.floor(diffMins / 60);
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  }
};
