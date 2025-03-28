import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Header from "@/components/Header";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Printer, Wifi, Bluetooth, Save, Settings as SettingsIcon } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import PasswordModal from "@/components/PasswordModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BluetoothPrinterScanner from "@/components/BluetoothPrinterScanner";
import { isBluetooth5Available, connectBluetoothPrinter, printToBluetoothPrinter } from "@/utils/printerUtils";
import { printerSchema, PrinterConfig } from "@/types/printerTypes";

const SettingsPage: React.FC = () => {
  const [showPasswordModal, setShowPasswordModal] = useState(true);
  const [printers, setPrinters] = useState<PrinterConfig[]>(() => {
    const savedPrinters = localStorage.getItem("restaurantPrinters");
    return savedPrinters ? JSON.parse(savedPrinters) : [];
  });

  const [editingPrinter, setEditingPrinter] = useState<PrinterConfig | null>(null);
  const [isAddingPrinter, setIsAddingPrinter] = useState(false);
  const [showBtScanner, setShowBtScanner] = useState(false);
  const [bluetoothAvailable, setBluetoothAvailable] = useState(false);

  const form = useForm<PrinterConfig>({
    resolver: zodResolver(printerSchema),
    defaultValues: {
      name: "",
      connectionType: "usb",
      isDefault: false,
      paperWidth: "80mm",
      enabled: true,
      location: "kitchen",
    },
  });

  React.useEffect(() => {
    setBluetoothAvailable(isBluetooth5Available());
  }, []);

  const savePrinterConfigs = (updatedPrinters: PrinterConfig[]) => {
    localStorage.setItem("restaurantPrinters", JSON.stringify(updatedPrinters));
    setPrinters(updatedPrinters);
  };

  const testPrinter = async (printer: PrinterConfig) => {
    const testContent = `
      TEST PRINT
      ==========
      Jayesh Machhi Khanaval
      Printer: ${printer.name}
      Type: ${printer.connectionType}
      Time: ${new Date().toLocaleTimeString()}
      Date: ${new Date().toLocaleDateString()}
      ==========
      If you can read this, your printer is working correctly!
    `;
    
    let success = false;
    
    toast({
      title: "Sending Test Print",
      description: `Attempting to send test page to ${printer.name}...`,
    });
    
    if (printer.connectionType === "bluetooth") {
      success = await printToBluetoothPrinter(testContent, printer);
    } else if (printer.connectionType === "network") {
      toast({
        title: "Network Printing",
        description: `Attempting to connect to ${printer.ipAddress}...`,
      });
    } else {
      toast({
        title: "USB Printing",
        description: "USB printing requires a backend service to communicate with the printer.",
      });
    }
    
    if (success) {
      toast({
        title: "Test Print Sent",
        description: `A test page has been successfully sent to ${printer.name}`,
      });
    } else {
      toast({
        title: "Print Failed",
        description: `Failed to send test print to ${printer.name}. Please check the printer connection.`,
        variant: "destructive",
      });
    }
  };

  const onSubmit = (data: PrinterConfig) => {
    let updatedPrinters: PrinterConfig[];

    if (editingPrinter) {
      updatedPrinters = printers.map(p => 
        p.name === editingPrinter.name ? data : p
      );
      toast({
        title: "Printer Updated",
        description: `Printer "${data.name}" has been updated.`,
      });
    } else {
      updatedPrinters = [...printers, data];
      toast({
        title: "Printer Added",
        description: `Printer "${data.name}" has been added.`,
      });
    }

    if (data.isDefault) {
      updatedPrinters = updatedPrinters.map(p => 
        p.location === data.location && p.name !== data.name
          ? { ...p, isDefault: false }
          : p
      );
    }

    savePrinterConfigs(updatedPrinters);
    setIsAddingPrinter(false);
    setEditingPrinter(null);
    form.reset();
  };

  const handleDeletePrinter = (printerName: string) => {
    const updatedPrinters = printers.filter(p => p.name !== printerName);
    savePrinterConfigs(updatedPrinters);
    toast({
      title: "Printer Removed",
      description: `Printer "${printerName}" has been removed.`,
    });
  };

  const handleEditPrinter = (printer: PrinterConfig) => {
    setEditingPrinter(printer);
    setIsAddingPrinter(true);
    form.reset(printer);
  };

  const handleBluetoothPrinterSelected = (device: BluetoothDevice) => {
    form.setValue("name", device.name || "Bluetooth Printer");
    form.setValue("bluetoothId", device.id);
    setShowBtScanner(false);
    
    toast({
      title: "Bluetooth Printer Selected",
      description: `${device.name || "Unknown printer"} has been selected. Complete the form to add it.`,
    });
  };

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case "network":
        return <Wifi className="h-4 w-4" />;
      case "bluetooth":
        return <Bluetooth className="h-4 w-4" />;
      default:
        return <Printer className="h-4 w-4" />;
    }
  };

  const getLocationLabel = (location: string) => {
    switch (location) {
      case "kitchen":
        return "Kitchen";
      case "billing":
        return "Billing Counter";
      case "inventory":
        return "Inventory";
      default:
        return location;
    }
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
      
      <main className="pt-20 pb-10 px-4 max-w-5xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center mb-6">
            <SettingsIcon className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h1>
          </div>
          
          <Collapsible defaultOpen className="mb-6">
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gray-100 dark:bg-gray-700 rounded-lg mb-2">
              <div className="flex items-center">
                <Printer className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                <span className="font-medium">Printer Configuration</span>
              </div>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 transition-transform" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <p className="text-gray-600 dark:text-gray-300">
                  Configure your kitchen, billing, and inventory printers
                </p>
                <Button 
                  onClick={() => {
                    setEditingPrinter(null);
                    setIsAddingPrinter(true);
                    form.reset({
                      name: "",
                      connectionType: "usb",
                      isDefault: false,
                      paperWidth: "80mm",
                      enabled: true,
                      location: "kitchen",
                    });
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Add Printer
                </Button>
              </div>
              
              {printers.length === 0 ? (
                <div className="text-center p-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                  <Printer className="h-10 w-10 mx-auto text-gray-400 dark:text-gray-600" />
                  <p className="mt-2 text-gray-500 dark:text-gray-400">No printers configured yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Add a printer to start printing orders, bills, and reports
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {["kitchen", "billing", "inventory"].map(location => {
                    const locationPrinters = printers.filter(p => p.location === location);
                    if (locationPrinters.length === 0) return null;
                    
                    return (
                      <div key={location} className="mb-6">
                        <h3 className="text-md font-medium mb-3 text-gray-800 dark:text-gray-200">
                          {getLocationLabel(location)} Printers
                        </h3>
                        <div className="space-y-2">
                          {locationPrinters.map(printer => (
                            <div 
                              key={printer.name} 
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                            >
                              <div className="flex items-center">
                                {getConnectionIcon(printer.connectionType)}
                                <div className="ml-3">
                                  <p className="font-medium">{printer.name}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {printer.connectionType.toUpperCase()} • {printer.paperWidth}
                                    {printer.isDefault && " • Default"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch 
                                  checked={printer.enabled} 
                                  onCheckedChange={(checked) => {
                                    const updatedPrinters = printers.map(p => 
                                      p.name === printer.name ? { ...p, enabled: checked } : p
                                    );
                                    savePrinterConfigs(updatedPrinters);
                                  }}
                                />
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => testPrinter(printer)}
                                >
                                  Test
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleEditPrinter(printer)}
                                >
                                  Edit
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 dark:border-red-800 dark:hover:border-red-700"
                                  onClick={() => handleDeletePrinter(printer.name)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
        
        <AnimatePresence>
          {isAddingPrinter && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
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
                      {editingPrinter ? "Edit Printer" : "Add New Printer"}
                    </h2>
                    
                    {showBtScanner ? (
                      <>
                        <BluetoothPrinterScanner onPrinterSelected={handleBluetoothPrinterSelected} />
                        <div className="flex justify-end mt-4">
                          <Button 
                            variant="outline" 
                            onClick={() => setShowBtScanner(false)}
                          >
                            Cancel Scan
                          </Button>
                        </div>
                      </>
                    ) : (
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Printer Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. Kitchen Printer 1" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Location</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select printer location" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="kitchen">Kitchen</SelectItem>
                                    <SelectItem value="billing">Billing Counter</SelectItem>
                                    <SelectItem value="inventory">Inventory</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="connectionType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Connection Type</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select connection type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="usb">USB</SelectItem>
                                    <SelectItem value="network">Network (WiFi/Ethernet)</SelectItem>
                                    <SelectItem value="bluetooth" disabled={!bluetoothAvailable}>
                                      Bluetooth {!bluetoothAvailable && "- Not supported"}
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          {form.watch("connectionType") === "bluetooth" && (
                            <div className="space-y-4">
                              <FormField
                                control={form.control}
                                name="bluetoothId"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Bluetooth ID</FormLabel>
                                    <div className="flex space-x-2">
                                      <FormControl>
                                        <Input placeholder="e.g. 00:11:22:33:FF" {...field} />
                                      </FormControl>
                                      <Button 
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowBtScanner(true)}
                                      >
                                        <Bluetooth className="h-4 w-4 mr-2" />
                                        Scan
                                      </Button>
                                    </div>
                                    <FormDescription>
                                      Click Scan to find available Bluetooth printers or enter the ID manually
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          )}
                          
                          {form.watch("connectionType") === "network" && (
                            <FormField
                              control={form.control}
                              name="ipAddress"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>IP Address</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. 192.168.1.100" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    The IP address of your network printer
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                          
                          <FormField
                            control={form.control}
                            name="paperWidth"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Paper Width</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select paper width" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="58mm">58mm (Standard Receipt)</SelectItem>
                                    <SelectItem value="80mm">80mm (Wide Receipt)</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  Standard receipt printers use 58mm, larger ones use 80mm
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="isDefault"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                  <FormLabel>Default Printer</FormLabel>
                                  <FormDescription>
                                    Make this the default printer for its location
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="enabled"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                  <FormLabel>Enabled</FormLabel>
                                  <FormDescription>
                                    Enable or disable this printer
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex justify-end space-x-3 pt-4">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => {
                                setIsAddingPrinter(false);
                                setEditingPrinter(null);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                              <Save className="h-4 w-4 mr-2" />
                              {editingPrinter ? "Update" : "Save"} Printer
                            </Button>
                          </div>
                        </form>
                      </Form>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default SettingsPage;
