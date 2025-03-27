
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Settings } from "lucide-react";

const Header: React.FC = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  const routes = [
    { path: "/", label: "Home", icon: "🏠" },
    { path: "/order", label: "Take Order", icon: "📝" },
    { path: "/kitchen", label: "Kitchen Display", icon: "🍲" },
    { path: "/billing", label: "Billing", icon: "💰" },
    { path: "/settings", label: "Settings", icon: "⚙️" },
  ];
  
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 px-6",
        scrolled
          ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            जयेश मच्छी खानावल
          </span>
        </Link>
        
        <nav className="hidden md:flex space-x-1">
          {routes.map((route) => {
            const isActive = location.pathname === route.path;
            
            return (
              <Link
                key={route.path}
                to={route.path}
                className={cn(
                  "relative px-4 py-2 rounded-full text-sm font-medium transition-all",
                  isActive
                    ? "text-white"
                    : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-blue-600 rounded-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
                <span className="relative z-10">{route.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="md:hidden flex space-x-1">
          {routes.map((route) => {
            const isActive = location.pathname === route.path;
            
            return (
              <Link
                key={route.path}
                to={route.path}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full transition-all",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <span>{route.icon}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
};

export default Header;
