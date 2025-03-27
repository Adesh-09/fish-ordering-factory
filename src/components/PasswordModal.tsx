
import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

interface PasswordModalProps {
  onSuccess: () => void;
  onCancel: () => void;
  title?: string;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ 
  onSuccess, 
  onCancel,
  title = "Enter Password"
}) => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // In a real app, this would be stored securely or verified on a server
  const ADMIN_PASSWORD = "admin123";
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    // Simulate a slight delay for UX
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        toast({
          title: "Access Granted",
          description: "You have successfully logged in.",
        });
        onSuccess();
      } else {
        setError("Incorrect password. Please try again.");
        toast({
          title: "Access Denied",
          description: "Incorrect password entered.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 800);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md"
      >
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Please enter your password to continue
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full ${error ? "border-red-500" : ""}`}
                autoFocus
              />
              {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            </div>
            
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Login"}
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default PasswordModal;
