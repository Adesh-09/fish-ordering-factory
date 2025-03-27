
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { OrdersProvider } from "@/hooks/useOrders";
import AnimatedLogo from "@/components/AnimatedLogo";

const Index = () => {
  const features = [
    {
      title: "Mobile Ordering",
      description: "Take orders quickly and easily on any device.",
      icon: "📝",
      path: "/order",
      color: "from-blue-600 to-blue-400",
    },
    {
      title: "Kitchen Display",
      description: "Real-time order tracking for kitchen staff.",
      icon: "🍲",
      path: "/kitchen",
      color: "from-green-600 to-green-400",
    },
    {
      title: "Billing System",
      description: "Generate and print bills automatically.",
      icon: "💰",
      path: "/billing",
      color: "from-purple-600 to-purple-400",
    },
  ];

  return (
    <OrdersProvider>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <header className="pt-20 pb-10 px-4 text-center">
          <AnimatedLogo className="mx-auto" />
        </header>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Restaurant Management System
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
              Streamline your operations with our elegant and intuitive restaurant management system.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * (index + 5), duration: 0.5 }}
              >
                <Link
                  to={feature.path}
                  className="block h-full transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md h-full overflow-hidden border border-gray-200 dark:border-gray-700 group">
                    <div className={`h-24 bg-gradient-to-r ${feature.color} flex items-center justify-center`}>
                      <span className="text-4xl">{feature.icon}</span>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="mt-20 text-center"
          >
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Designed specifically for Jayesh Machhi Khanaval, this system helps streamline order taking, 
              kitchen operations, and billing processes to deliver an exceptional dining experience.
            </p>
          </motion.div>
        </main>
        
        <footer className="py-6 px-4 text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} जयेश मच्छी खानावल. All rights reserved.</p>
        </footer>
      </div>
    </OrdersProvider>
  );
};

export default Index;
