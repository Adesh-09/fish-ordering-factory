import { MenuItem, getMenuItemById } from "./menuData";
import { printToBluetoothPrinter, printToNetworkPrinter } from "./printerUtils";
import { InventoryItem, updateInventoryQuantity } from "./inventoryUtils";

export interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  notes?: string;
  customizations?: string[];
  isTakeAway?: boolean;
}

export interface Order {
  id: string;
  orderNumber: number;
  tableNumber: number;
  items: OrderItem[];
  status: "pending" | "preparing" | "ready" | "served" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
  customerName?: string;
  isPrinted: boolean;
  isTakeAway?: boolean;
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

export interface OrderAnalytics {
  date: string;
  totalOrders: number;
  totalSales: number;
  itemsSold: Record<string, number>;
  averageOrderValue: number;
  takeAwayOrders: number;
  dineInOrders: number;
}

export interface OrderSequence {
  currentNumber: number;
  date: string;
}

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const getNextOrderNumber = (): number => {
  const today = new Date();
  const dateKey = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
  
  const savedSequence = localStorage.getItem("orderSequence");
  let sequence: OrderSequence = { currentNumber: 0, date: dateKey };
  
  if (savedSequence) {
    const parsedSequence = JSON.parse(savedSequence) as OrderSequence;
    
    if (parsedSequence.date !== dateKey) {
      sequence = { currentNumber: 1, date: dateKey };
    } else {
      sequence = { 
        currentNumber: parsedSequence.currentNumber + 1,
        date: dateKey
      };
    }
  } else {
    sequence = { currentNumber: 1, date: dateKey };
  }
  
  localStorage.setItem("orderSequence", JSON.stringify(sequence));
  
  return sequence.currentNumber;
};

export const calculateOrderTotal = (order: Order): number => {
  return order.items.reduce((total, item) => {
    const menuItem = getMenuItemById(item.menuItemId);
    if (menuItem) {
      return total + (menuItem.price * item.quantity);
    }
    return total;
  }, 0);
};

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toFixed(2)}`;
};

export const createOrder = (
  tableNumber: number,
  items: OrderItem[],
  customerName?: string,
  notes?: string,
  isTakeAway: boolean = false
): Order => {
  return {
    id: generateId(),
    orderNumber: getNextOrderNumber(),
    tableNumber,
    items,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
    customerName,
    notes,
    isPrinted: false,
    isTakeAway,
  };
};

export const addItemToOrder = (order: Order, menuItemId: string, quantity: number = 1, notes?: string, isTakeAway?: boolean): Order => {
  const existingItemIndex = order.items.findIndex(item => 
    item.menuItemId === menuItemId && item.isTakeAway === isTakeAway
  );
  
  if (existingItemIndex >= 0) {
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
    return {
      ...order,
      items: [
        ...order.items,
        {
          id: generateId(),
          menuItemId,
          quantity,
          notes,
          isTakeAway
        }
      ],
      updatedAt: new Date(),
    };
  }
};

export const removeItemFromOrder = (order: Order, orderItemId: string): Order => {
  return {
    ...order,
    items: order.items.filter(item => item.id !== orderItemId),
    updatedAt: new Date(),
  };
};

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

export const updateOrderStatus = (order: Order, status: Order['status']): Order => {
  return {
    ...order,
    status,
    updatedAt: new Date(),
  };
};

export const markOrderAsPrinted = (order: Order): Order => {
  return {
    ...order,
    isPrinted: true,
    updatedAt: new Date(),
  };
};

export const getConfiguredPrinters = (): PrinterConfig[] => {
  const savedPrinters = localStorage.getItem("restaurantPrinters");
  return savedPrinters ? JSON.parse(savedPrinters) : [];
};

export const getDefaultPrinter = (location: PrinterConfig['location']): PrinterConfig | null => {
  const printers = getConfiguredPrinters();
  const defaultPrinter = printers.find(p => p.location === location && p.isDefault && p.enabled);
  return defaultPrinter || null;
};

export const getEnabledPrinters = (location: PrinterConfig['location']): PrinterConfig[] => {
  const printers = getConfiguredPrinters();
  return printers.filter(p => p.location === location && p.enabled);
};

export const printToPrinter = async (content: string, printer: PrinterConfig): Promise<boolean> => {
  console.log(`Attempting to print to ${printer.name} (${printer.connectionType})`);

  switch (printer.connectionType) {
    case "bluetooth":
      const bluetoothResult = await printToBluetoothPrinter(content, printer);
      return bluetoothResult.success;
    case "network":
      const networkResult = await printToNetworkPrinter(content, printer);
      return networkResult.success;
    case "usb":
      console.log("USB printing requires a system service. This is a simulation.");
      return true; // In a real app, this would connect to a local service
    default:
      console.error("Unknown printer connection type");
      return false;
  }
};

export const generatePrintableOrder = (order: Order): string => {
  let printContent = `
    JAYESH MACHHI KHANAVAL
    ------------------------------
    Order #: ${order.orderNumber}
    Order ID: ${order.id.slice(0, 8)}
    Table: ${order.tableNumber}
    Time: ${order.createdAt.toLocaleTimeString()}
    Date: ${order.createdAt.toLocaleDateString()}
    ${order.isTakeAway ? "*** TAKE AWAY ***" : ""}
    ------------------------------
    Items:
  `;
  
  order.items.forEach(item => {
    const menuItem = getMenuItemById(item.menuItemId);
    if (menuItem) {
      printContent += `
      ${item.quantity} x ${menuItem.nameEn} (${formatCurrency(menuItem.price)})
      ${item.isTakeAway ? "[TAKE AWAY]" : ""}
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

export const printOrderToKitchen = async (order: Order): Promise<boolean> => {
  const kitchenPrinter = getDefaultPrinter("kitchen");
  if (!kitchenPrinter) {
    console.error("No kitchen printer configured");
    return false;
  }
  
  const printContent = generatePrintableOrder(order);
  return await printToPrinter(printContent, kitchenPrinter);
};

export const printBill = async (order: Order): Promise<boolean> => {
  const billingPrinter = getDefaultPrinter("billing");
  if (!billingPrinter) {
    console.error("No billing printer configured");
    return false;
  }
  
  let billContent = generatePrintableOrder(order);
  const total = calculateOrderTotal(order);
  const gst = total * 0.05;
  
  billContent += `
    GST (5%): ${formatCurrency(gst)}
    Grand Total: ${formatCurrency(total + gst)}
    
    Thank you for dining with us!
    Please visit again.
  `;
  
  return await printToPrinter(billContent, billingPrinter);
};

export const printInventoryReport = async (inventoryItems: any[]): Promise<boolean> => {
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
  
  return await printToPrinter(reportContent, inventoryPrinter);
};

export const printAttendanceReport = async (staff: any[], date: Date): Promise<boolean> => {
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
  
  return await printToPrinter(reportContent, inventoryPrinter);
};

export const formatOrderTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

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

export const updateInventoryFromOrder = (order: Order, inventoryItems: InventoryItem[]): InventoryItem[] => {
  if (order.status !== "completed") {
    return inventoryItems;
  }
  
  let updatedInventory = [...inventoryItems];
  
  order.items.forEach(orderItem => {
    const menuItem = getMenuItemById(orderItem.menuItemId);
    if (!menuItem || !menuItem.inventoryItemId) return;
    
    const inventoryItemIndex = updatedInventory.findIndex(item => item.id === menuItem.inventoryItemId);
    if (inventoryItemIndex === -1) return;
    
    const currentQuantity = updatedInventory[inventoryItemIndex].quantity;
    const newQuantity = Math.max(0, currentQuantity - orderItem.quantity);
    
    updatedInventory[inventoryItemIndex] = {
      ...updatedInventory[inventoryItemIndex],
      quantity: newQuantity,
      lastUpdated: new Date(),
      inStock: newQuantity > 0
    };
  });
  
  return updatedInventory;
};

export const saveOrderAnalytics = (order: Order): void => {
  if (order.status !== "completed") return;
  
  const today = new Date();
  const monthKey = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
  const analyticsKey = `analytics-${monthKey}`;
  
  const existingData = localStorage.getItem(analyticsKey);
  let monthlyAnalytics: OrderAnalytics[] = existingData ? JSON.parse(existingData) : [];
  
  const orderDate = new Date(order.createdAt);
  const dateKey = `${orderDate.getFullYear()}-${(orderDate.getMonth() + 1).toString().padStart(2, '0')}-${orderDate.getDate().toString().padStart(2, '0')}`;
  
  const existingEntryIndex = monthlyAnalytics.findIndex(entry => entry.date === dateKey);
  const orderTotal = calculateOrderTotal(order);
  
  if (existingEntryIndex >= 0) {
    const existingEntry = monthlyAnalytics[existingEntryIndex];
    const newTotalOrders = existingEntry.totalOrders + 1;
    const newTotalSales = existingEntry.totalSales + orderTotal;
    
    const updatedItemsSold = { ...existingEntry.itemsSold };
    order.items.forEach(item => {
      const menuItem = getMenuItemById(item.menuItemId);
      if (menuItem) {
        const itemKey = menuItem.id;
        updatedItemsSold[itemKey] = (updatedItemsSold[itemKey] || 0) + item.quantity;
      }
    });
    
    monthlyAnalytics[existingEntryIndex] = {
      ...existingEntry,
      totalOrders: newTotalOrders,
      totalSales: newTotalSales,
      itemsSold: updatedItemsSold,
      averageOrderValue: newTotalSales / newTotalOrders,
      takeAwayOrders: existingEntry.takeAwayOrders + (order.isTakeAway ? 1 : 0),
      dineInOrders: existingEntry.dineInOrders + (order.isTakeAway ? 0 : 1)
    };
  } else {
    const itemsSold: Record<string, number> = {};
    order.items.forEach(item => {
      const menuItem = getMenuItemById(item.menuItemId);
      if (menuItem) {
        itemsSold[menuItem.id] = item.quantity;
      }
    });
    
    monthlyAnalytics.push({
      date: dateKey,
      totalOrders: 1,
      totalSales: orderTotal,
      itemsSold,
      averageOrderValue: orderTotal,
      takeAwayOrders: order.isTakeAway ? 1 : 0,
      dineInOrders: order.isTakeAway ? 0 : 1
    });
  }
  
  localStorage.setItem(analyticsKey, JSON.stringify(monthlyAnalytics));
};

export const printMonthlyReport = async (month: Date): Promise<boolean> => {
  const monthKey = `${month.getFullYear()}-${(month.getMonth() + 1).toString().padStart(2, '0')}`;
  const analyticsKey = `analytics-${monthKey}`;
  
  const analyticsData = localStorage.getItem(analyticsKey);
  if (!analyticsData) return false;
  
  const monthlyAnalytics: OrderAnalytics[] = JSON.parse(analyticsData);
  
  const printer = getDefaultPrinter("billing") || getDefaultPrinter("inventory");
  if (!printer) return false;
  
  let reportContent = `
    JAYESH MACHHI KHANAVAL
    ------------------------------
    MONTHLY REPORT: ${month.toLocaleString('default', { month: 'long', year: 'numeric' })}
    ------------------------------
    
    Date        Orders   Sales     Avg Order   Take Away
    ------------------------------
  `;
  
  let totalOrders = 0;
  let totalSales = 0;
  let totalTakeAway = 0;
  
  monthlyAnalytics.forEach(day => {
    const dateParts = day.date.split('-');
    const shortDate = `${dateParts[2]}/${dateParts[1]}`;
    
    reportContent += `
    ${shortDate.padEnd(12)}${String(day.totalOrders).padEnd(9)}${formatCurrency(day.totalSales).padEnd(10)}${formatCurrency(day.averageOrderValue).padEnd(12)}${day.takeAwayOrders}
    `;
    
    totalOrders += day.totalOrders;
    totalSales += day.totalSales;
    totalTakeAway += day.takeAwayOrders;
  });
  
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
  
  reportContent += `
    ------------------------------
    TOTALS:     ${totalOrders}     ${formatCurrency(totalSales)}   ${formatCurrency(avgOrderValue)}    ${totalTakeAway}
    ------------------------------
  `;
  
  return await printToPrinter(reportContent, printer);
};
