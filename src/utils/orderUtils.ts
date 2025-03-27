
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

export interface PrinterConfig {
  name: string;
  ipAddress?: string;
  bluetoothId?: string;
  connectionType: "usb" | "network" | "bluetooth";
  isDefault: boolean;
  paperWidth: "58mm" | "80mm";
  enabled: boolean;
  location: "kitchen" | "billing" | "inventory";
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

// Get configured printers
export const getConfiguredPrinters = (): PrinterConfig[] => {
  const savedPrinters = localStorage.getItem("restaurantPrinters");
  return savedPrinters ? JSON.parse(savedPrinters) : [];
};

// Get default printer for a location
export const getDefaultPrinter = (location: PrinterConfig['location']): PrinterConfig | null => {
  const printers = getConfiguredPrinters();
  const defaultPrinter = printers.find(p => p.location === location && p.isDefault && p.enabled);
  return defaultPrinter || null;
};

// Get all enabled printers for a location
export const getEnabledPrinters = (location: PrinterConfig['location']): PrinterConfig[] => {
  const printers = getConfiguredPrinters();
  return printers.filter(p => p.location === location && p.enabled);
};

// Print to a specific printer
export const printToPrinter = (content: string, printer: PrinterConfig): boolean => {
  console.log(`Printing to ${printer.name} (${printer.connectionType}):\n${content}`);

  // In a real app, this would use device APIs to send data to the printer
  // The implementation depends on the printer type and connection method
  // For example, network printers might use a POST request to their IP
  // USB/Bluetooth printers would use Web Bluetooth or USB API

  // This is a simulation of a successful print
  return true;
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

// Print order to kitchen
export const printOrderToKitchen = (order: Order): boolean => {
  const kitchenPrinter = getDefaultPrinter("kitchen");
  if (!kitchenPrinter) {
    console.error("No kitchen printer configured");
    return false;
  }
  
  const printContent = generatePrintableOrder(order);
  return printToPrinter(printContent, kitchenPrinter);
};

// Print bill
export const printBill = (order: Order): boolean => {
  const billingPrinter = getDefaultPrinter("billing");
  if (!billingPrinter) {
    console.error("No billing printer configured");
    return false;
  }
  
  // Generate a bill format that includes taxes, etc.
  let billContent = generatePrintableOrder(order);
  const total = calculateOrderTotal(order);
  const gst = total * 0.05; // Assuming 5% GST
  
  billContent += `
    GST (5%): ${formatCurrency(gst)}
    Grand Total: ${formatCurrency(total + gst)}
    
    Thank you for dining with us!
    Please visit again.
  `;
  
  return printToPrinter(billContent, billingPrinter);
};

// Print inventory report
export const printInventoryReport = (inventoryItems: any[]): boolean => {
  const inventoryPrinter = getDefaultPrinter("inventory");
  if (!inventoryPrinter) {
    console.error("No inventory printer configured");
    return false;
  }
  
  let reportContent = `
    JAYESH MACHHI KHANAVAL
    ------------------------------
    INVENTORY REPORT
    Date: ${new Date().toLocaleDateString()}
    ------------------------------
    
    Item              Quantity    Status
    ------------------------------
  `;
  
  inventoryItems.forEach(item => {
    reportContent += `
    ${item.name.padEnd(18)}${String(item.quantity).padEnd(12)}${item.status}
    `;
  });
  
  reportContent += `
    ------------------------------
    Total Items: ${inventoryItems.length}
    ------------------------------
  `;
  
  return printToPrinter(reportContent, inventoryPrinter);
};

// Print attendance report
export const printAttendanceReport = (staff: any[], date: Date): boolean => {
  const inventoryPrinter = getDefaultPrinter("inventory") || getDefaultPrinter("billing");
  if (!inventoryPrinter) {
    console.error("No printer configured for reports");
    return false;
  }
  
  let reportContent = `
    JAYESH MACHHI KHANAVAL
    ------------------------------
    STAFF ATTENDANCE
    Date: ${date.toLocaleDateString()}
    ------------------------------
    
    Name              Position     Clock In    Clock Out   Hours
    ------------------------------
  `;
  
  staff.forEach(employee => {
    const clockIn = employee.clockIn ? new Date(employee.clockIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "N/A";
    const clockOut = employee.clockOut ? new Date(employee.clockOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "N/A";
    
    let hours = "N/A";
    if (employee.clockIn && employee.clockOut) {
      const timeWorked = (new Date(employee.clockOut).getTime() - new Date(employee.clockIn).getTime()) / (1000 * 60 * 60);
      hours = timeWorked.toFixed(1);
    }
    
    reportContent += `
    ${employee.name.padEnd(18)}${employee.position.padEnd(12)}${clockIn.padEnd(12)}${clockOut.padEnd(12)}${hours}
    `;
  });
  
  reportContent += `
    ------------------------------
    Total Staff: ${staff.length}
    ------------------------------
  `;
  
  return printToPrinter(reportContent, inventoryPrinter);
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
