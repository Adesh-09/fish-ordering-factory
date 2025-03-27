
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrders } from "@/hooks/useOrders";
import { formatCurrency } from "@/utils/orderUtils";
import { getMenuItemById } from "@/utils/menuData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Users, ChartBar } from "lucide-react";
import PasswordModal from "@/components/PasswordModal";

interface SalesData {
  itemId: string;
  itemName: string;
  quantity: number;
  revenue: number;
}

const AnalyticsPage = () => {
  const [showPasswordModal, setShowPasswordModal] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const { orders } = useOrders();
  const navigate = useNavigate();
  
  // Create analytics data
  const [analyticsData, setAnalyticsData] = useState<{
    salesByItem: SalesData[];
    topSellingItems: SalesData[];
    lowSellingItems: SalesData[];
    averageItems: SalesData[];
    totalSales: number;
    orderCount: number;
    totalItems: number;
    averageOrderValue: number;
  }>({
    salesByItem: [],
    topSellingItems: [],
    lowSellingItems: [],
    averageItems: [],
    totalSales: 0,
    orderCount: 0,
    totalItems: 0,
    averageOrderValue: 0,
  });
  
  // Filter orders based on selected period
  const getFilteredOrders = () => {
    const now = new Date();
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      
      switch (selectedPeriod) {
        case "today":
          return orderDate.toDateString() === now.toDateString();
        case "yesterday":
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          return orderDate.toDateString() === yesterday.toDateString();
        case "week":
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return orderDate >= weekAgo;
        case "month":
          const monthAgo = new Date(now);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return orderDate >= monthAgo;
        default:
          return true;
      }
    });
  };
  
  // Calculate analytics data
  useEffect(() => {
    const filteredOrders = getFilteredOrders();
    
    // Initialize data structure
    const itemSales: Record<string, SalesData> = {};
    let totalRevenue = 0;
    let totalItems = 0;
    
    // Process orders and items
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const menuItem = getMenuItemById(item.menuItemId);
        if (menuItem) {
          const itemRevenue = menuItem.price * item.quantity;
          totalRevenue += itemRevenue;
          totalItems += item.quantity;
          
          if (itemSales[item.menuItemId]) {
            itemSales[item.menuItemId].quantity += item.quantity;
            itemSales[item.menuItemId].revenue += itemRevenue;
          } else {
            itemSales[item.menuItemId] = {
              itemId: item.menuItemId,
              itemName: menuItem.nameEn,
              quantity: item.quantity,
              revenue: itemRevenue,
            };
          }
        }
      });
    });
    
    // Convert to array and sort
    const salesByItem = Object.values(itemSales);
    
    // Sort by quantity for top/low selling items
    const sortedByQuantity = [...salesByItem].sort((a, b) => b.quantity - a.quantity);
    
    const topCount = Math.min(5, Math.ceil(sortedByQuantity.length * 0.25));
    const lowCount = Math.min(5, Math.ceil(sortedByQuantity.length * 0.25));
    
    const topSellingItems = sortedByQuantity.slice(0, topCount);
    const lowSellingItems = [...sortedByQuantity].reverse().slice(0, lowCount);
    
    // Calculate average selling items (middle 50%)
    const startIndex = Math.ceil(sortedByQuantity.length * 0.25);
    const endIndex = Math.floor(sortedByQuantity.length * 0.75);
    const averageItems = sortedByQuantity.slice(startIndex, endIndex + 1);
    
    // Update analytics data
    setAnalyticsData({
      salesByItem,
      topSellingItems,
      lowSellingItems,
      averageItems,
      totalSales: totalRevenue,
      orderCount: filteredOrders.length,
      totalItems,
      averageOrderValue: filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0,
    });
  }, [orders, selectedPeriod]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  if (showPasswordModal) {
    return (
      <PasswordModal
        onSuccess={() => setShowPasswordModal(false)}
        onCancel={() => navigate(-1)}
        title="Analytics Access"
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300">
                Track your restaurant's performance
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analyticsData.totalSales)}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {analyticsData.orderCount} orders
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
              <ChartBar className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analyticsData.averageOrderValue)}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Per order average
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Items Sold</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalItems}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Items sold 
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Order Count</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.orderCount}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Total orders
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="top-selling">
          <TabsList className="mb-6 bg-white dark:bg-gray-800 p-1">
            <TabsTrigger value="top-selling">
              <TrendingUp className="h-4 w-4 mr-2" />
              Top Selling
            </TabsTrigger>
            <TabsTrigger value="low-selling">
              <TrendingDown className="h-4 w-4 mr-2" />
              Low Selling
            </TabsTrigger>
            <TabsTrigger value="average">
              <ChartBar className="h-4 w-4 mr-2" />
              Average Items
            </TabsTrigger>
            <TabsTrigger value="all-items">All Items</TabsTrigger>
          </TabsList>
          
          <TabsContent value="top-selling" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Items</CardTitle>
                <CardDescription>
                  Your best performing menu items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {analyticsData.topSellingItems.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analyticsData.topSellingItems}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="itemName" 
                          angle={-45} 
                          textAnchor="end" 
                          height={80}
                          interval={0}
                        />
                        <YAxis />
                        <Tooltip formatter={(value, name) => [value, name === "revenue" ? "Revenue" : "Quantity"]} />
                        <Legend />
                        <Bar dataKey="quantity" name="Quantity Sold" fill="#0088FE" />
                        <Bar dataKey="revenue" name="Revenue (₹)" fill="#00C49F" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500 dark:text-gray-400">No data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Items by Quantity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {analyticsData.topSellingItems.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analyticsData.topSellingItems}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="quantity"
                          >
                            {analyticsData.topSellingItems.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} items`, "Quantity"]} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500 dark:text-gray-400">No data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Top Items by Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {analyticsData.topSellingItems.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analyticsData.topSellingItems}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="revenue"
                          >
                            {analyticsData.topSellingItems.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [formatCurrency(value as number), "Revenue"]} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500 dark:text-gray-400">No data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="low-selling" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Low Selling Items</CardTitle>
                <CardDescription>
                  Items that need attention or promotion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {analyticsData.lowSellingItems.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analyticsData.lowSellingItems}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="itemName" 
                          angle={-45} 
                          textAnchor="end" 
                          height={80}
                          interval={0}
                        />
                        <YAxis />
                        <Tooltip formatter={(value, name) => [value, name === "revenue" ? "Revenue" : "Quantity"]} />
                        <Legend />
                        <Bar dataKey="quantity" name="Quantity Sold" fill="#FF8042" />
                        <Bar dataKey="revenue" name="Revenue (₹)" fill="#FFBB28" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500 dark:text-gray-400">No data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="average" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Average Performing Items</CardTitle>
                <CardDescription>
                  Items with moderate sales performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {analyticsData.averageItems.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analyticsData.averageItems}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="itemName" 
                          angle={-45} 
                          textAnchor="end" 
                          height={80}
                          interval={0}
                        />
                        <YAxis />
                        <Tooltip formatter={(value, name) => [value, name === "revenue" ? "Revenue" : "Quantity"]} />
                        <Legend />
                        <Bar dataKey="quantity" name="Quantity Sold" fill="#8884d8" />
                        <Bar dataKey="revenue" name="Revenue (₹)" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500 dark:text-gray-400">No data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="all-items" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Menu Items Performance</CardTitle>
                <CardDescription>
                  Complete overview of all menu items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  {analyticsData.salesByItem.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analyticsData.salesByItem}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="itemName" 
                          angle={-45} 
                          textAnchor="end" 
                          height={80}
                          interval={0}
                        />
                        <YAxis />
                        <Tooltip formatter={(value, name) => [value, name === "revenue" ? "Revenue" : "Quantity"]} />
                        <Legend />
                        <Bar dataKey="quantity" name="Quantity Sold" fill="#0088FE" />
                        <Bar dataKey="revenue" name="Revenue (₹)" fill="#00C49F" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500 dark:text-gray-400">No data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AnalyticsPage;
