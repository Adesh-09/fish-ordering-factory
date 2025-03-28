
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AnimatedLogo from "@/components/AnimatedLogo";
import { Users, ChartBar, Box, Printer, Lock, Coffee, Settings } from "lucide-react";

const Index = () => {
  const menuItems = [
    {
      title: "Order Management",
      description: "Create and manage customer orders",
      icon: <Printer className="w-10 h-10 text-blue-600" />,
      link: "/order",
      color: "from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800"
    },
    {
      title: "Kitchen Display",
      description: "View orders that need to be prepared",
      icon: <Coffee className="w-10 h-10 text-red-600" />,
      link: "/kitchen",
      color: "from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20",
      borderColor: "border-red-200 dark:border-red-800"
    },
    {
      title: "Billing System",
      description: "Generate and print bills",
      icon: <Lock className="w-10 h-10 text-purple-600" />,
      link: "/billing",
      color: "from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20",
      borderColor: "border-purple-200 dark:border-purple-800"
    },
    {
      title: "Inventory Management",
      description: "Track fish, flour, drinks and other supplies",
      icon: <Box className="w-10 h-10 text-green-600" />,
      link: "/inventory",
      color: "from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20",
      borderColor: "border-green-200 dark:border-green-800"
    },
    {
      title: "Analytics",
      description: "View sales reports and charts",
      icon: <ChartBar className="w-10 h-10 text-yellow-600" />,
      link: "/analytics",
      color: "from-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:to-yellow-900/20",
      borderColor: "border-yellow-200 dark:border-yellow-800"
    },
    {
      title: "Attendance",
      description: "Track employee attendance",
      icon: <Users className="w-10 h-10 text-cyan-600" />,
      link: "/attendance",
      color: "from-cyan-50 to-cyan-100 dark:from-cyan-950/30 dark:to-cyan-900/20", 
      borderColor: "border-cyan-200 dark:border-cyan-800"
    },
    {
      title: "Settings",
      description: "Configure printer settings and preferences",
      icon: <Settings className="w-10 h-10 text-gray-600" />,
      link: "/settings",
      color: "from-gray-50 to-gray-100 dark:from-gray-950/30 dark:to-gray-900/20",
      borderColor: "border-gray-200 dark:border-gray-800"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 flex flex-col">
      <AnimatedLogo className="my-8" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="flex justify-center mb-10"
      >
        <div className="relative">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              delay: 0.6, 
              duration: 0.7,
              type: "spring",
              stiffness: 100
            }}
            className="relative"
          >
            <motion.img 
              src="/lovable-uploads/7d8ba772-c3a0-4ea0-bed6-713a66ab35a6.png" 
              alt="Jayesh - Owner" 
              className="w-48 h-48 md:w-56 md:h-56 rounded-full object-cover border-4 border-blue-500 shadow-xl"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                borderColor: "#3B82F6" 
              }}
              animate={{
                y: [0, -8, 0]
              }}
              transition={{
                y: {
                  repeat: Infinity,
                  duration: 3,
                  ease: "easeInOut"
                }
              }}
            />
            <motion.div 
              className="absolute -bottom-2 -right-2 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.4, type: "spring" }}
              whileHover={{ rotate: 10, scale: 1.1 }}
            >
              <span className="text-white text-lg font-bold">👑</span>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-full whitespace-nowrap shadow-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            whileHover={{ scale: 1.05, backgroundColor: "#2563EB" }}
          >
            Jayesh - Proud Owner
          </motion.div>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="max-w-6xl w-full mx-auto mt-8 md:mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {menuItems.map((item, index) => (
          <Link
            key={item.title}
            to={item.link}
            className="block"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
              className={`relative overflow-hidden h-full rounded-2xl border ${item.borderColor} bg-gradient-to-br ${item.color} p-6 flex flex-col transition-all duration-300`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm">
                  {item.icon}
                </div>
                <motion.div
                  whileHover={{ rotate: 15 }}
                  className="text-gray-400 dark:text-gray-600"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.div>
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {item.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {item.description}
              </p>
            </motion.div>
          </Link>
        ))}
      </motion.div>
      
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.5 }}
        className="mt-auto py-6 text-center text-gray-500 dark:text-gray-400"
      >
        <p>© {new Date().getFullYear()} जयेश मच्छी खानावल - Jayesh Machhi Khanaval</p>
      </motion.footer>
    </div>
  );
};

export default Index;
