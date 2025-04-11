import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, Loader2, Shield, Clock, Share2 } from "lucide-react";
import { generateVerificationCode } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface UpiVerificationModalProps {
  isOpen: boolean;
  verificationCode: string;
  onClose: () => void;
}

export default function UpiVerificationModal({ 
  isOpen, 
  verificationCode,
  onClose 
}: UpiVerificationModalProps) {
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [code, setCode] = useState(verificationCode);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "verifying" | "completed">("pending");
  const [codeVisible, setCodeVisible] = useState(true);

  useEffect(() => {
    if (isOpen) {
      // Reset timer and status when modal opens
      setTimeLeft(120);
      setCode(verificationCode);
      setVerificationStatus("pending");
      setCodeVisible(true);
      
      // Setup countdown timer
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // For demo purposes: Simulate verification after 3-4 seconds
      const simulateVerification = setTimeout(() => {
        setVerificationStatus("verifying");
        
        // Show "completed" status after 1.5 more seconds
        setTimeout(() => {
          setVerificationStatus("completed");
          
          // Show success toast
          toast({
            title: "Payment Verified",
            description: "The recipient has verified the payment. Processing transaction...",
            variant: "default"
          });
          
          // Close modal after showing completion for 2 seconds
          setTimeout(() => {
            onClose();
          }, 2000);
        }, 1500);
      }, 3000 + Math.random() * 1000); // Random time between 3-4 seconds
      
      return () => {
        clearInterval(timerRef.current!);
        clearTimeout(simulateVerification);
      };
    } else {
      // Clear timer when modal closes
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    
    // Clean up on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isOpen, verificationCode, onClose, toast]);

  const refreshCode = () => {
    // Only allow refresh if not already verifying/completed
    if (verificationStatus === "pending") {
      setCode(generateVerificationCode());
      setTimeLeft(120); // Reset timer on refresh
      
      // Animation: briefly hide the code, then show the new one
      setCodeVisible(false);
      setTimeout(() => setCodeVisible(true), 300);
    }
  };

  // Format time as MM:SS
  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Calculate percentage of time remaining
  const percentLeft = (timeLeft / 120) * 100;

  // Status-based colors and styles
  const statusTheme = {
    pending: {
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      progressColor: "from-blue-500 to-indigo-600",
      textColor: "text-blue-600",
    },
    verifying: {
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      progressColor: "from-amber-500 to-orange-600",
      textColor: "text-amber-600",
    },
    completed: {
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      progressColor: "from-emerald-500 to-green-600",
      textColor: "text-emerald-600",
    },
  };
  
  const currentTheme = statusTheme[verificationStatus];
  
  // Code digit animation variants
  const codeVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
        type: "spring",
        stiffness: 200,
      }
    }),
    exit: { opacity: 0, y: -20 }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Only allow closing if not in the middle of verification
      if (!open && verificationStatus !== "verifying") {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-md overflow-hidden bg-white rounded-xl border-0 shadow-2xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          {/* Background gradient effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 z-0"></div>
          
          {/* Decorative circles */}
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/5 z-0"></div>
          <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-500/10 to-purple-500/5 z-0"></div>
          
          <div className="relative z-10">
            <DialogHeader className="pb-0">
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                Payment Verification
              </DialogTitle>
            </DialogHeader>
            
            {/* Timer bar */}
            {verificationStatus !== "completed" && (
              <div className="mb-6 pt-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-gray-600 flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                    Session expires in <span className="font-medium ml-1">{formatTime()}</span>
                  </p>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    className={`h-full rounded-full bg-gradient-to-r ${currentTheme.progressColor}`}
                    initial={{ width: "100%" }}
                    animate={{ width: `${percentLeft}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            )}
            
            <div className="text-center mb-8">
              <motion.div 
                className={`inline-flex items-center justify-center h-20 w-20 rounded-full ${currentTheme.iconBg} ${currentTheme.iconColor} mb-4 relative overflow-hidden`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  transition: { type: "spring", stiffness: 200, damping: 15 }
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent"
                  animate={{
                    rotate: verificationStatus === "verifying" ? [0, 360] : 0,
                  }}
                  transition={{
                    duration: 2,
                    repeat: verificationStatus === "verifying" ? Infinity : 0,
                    ease: "linear",
                  }}
                />
                {verificationStatus === "completed" ? (
                  <CheckCircle className="h-10 w-10" />
                ) : verificationStatus === "verifying" ? (
                  <Loader2 className="h-10 w-10 animate-spin" />
                ) : (
                  <motion.div
                    whileHover={{ rotate: 5, scale: 1.05 }}
                  >
                    <Shield className="h-10 w-10" />
                  </motion.div>
                )}
              </motion.div>
              
              <motion.h4 
                className={`text-xl font-bold mb-2 ${currentTheme.textColor}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {verificationStatus === "completed" 
                  ? "Payment Verified" 
                  : verificationStatus === "verifying"
                    ? "Verifying Payment"
                    : "Verification Code"
                }
              </motion.h4>
              
              <motion.p 
                className="text-gray-600 mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {verificationStatus === "completed" ? (
                  <span className="text-emerald-600">
                    The recipient has verified the payment successfully
                  </span>
                ) : verificationStatus === "verifying" ? (
                  <span>
                    The recipient is verifying the payment
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Share2 className="h-4 w-4 mr-1.5" />
                    Share this code with the receiver to complete the transaction
                  </span>
                )}
              </motion.p>
              
              {verificationStatus !== "completed" && verificationStatus !== "verifying" && (
                <AnimatePresence mode="wait">
                  {codeVisible && (
                    <motion.div 
                      className="flex justify-center mt-6"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="relative px-2 py-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm border border-blue-100">
                        <div className="flex space-x-3">
                          {code.split('').map((digit, i) => (
                            <motion.div
                              key={`${digit}-${i}`}
                              custom={i}
                              variants={codeVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              className="w-11 h-14 flex items-center justify-center rounded-md bg-white border border-blue-200 shadow-sm"
                            >
                              <span className="text-2xl font-bold text-gray-800">{digit}</span>
                            </motion.div>
                          ))}
                        </div>
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 overflow-hidden rounded-xl">
                          <motion.div
                            className="w-20 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent absolute"
                            initial={{ x: -100 }}
                            animate={{ x: 400 }}
                            transition={{ 
                              repeat: Infinity, 
                              duration: 2, 
                              repeatDelay: 1 
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
              
              {verificationStatus === "completed" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="mt-6"
                >
                  <div className="py-3 px-4 rounded-lg bg-emerald-50 border border-emerald-100">
                    <p className="text-emerald-800 font-medium">Transaction successfully verified and secured on blockchain at no additional cost</p>
                  </div>
                </motion.div>
              )}
            </div>
            
            <motion.div 
              className="space-y-2 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              {verificationStatus === "pending" && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <ul className="text-sm text-blue-900 space-y-2">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>Request sent to receiver to approve payment</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>Share this code with the receiver</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>Receiver must enter this code within 2 minutes</span>
                    </li>
                  </ul>
                </div>
              )}
              
              {verificationStatus === "verifying" && (
                <div className="bg-amber-50 rounded-lg p-4">
                  <ul className="text-sm text-amber-900 space-y-2">
                    <li className="flex items-start">
                      <span className="text-amber-500 mr-2">•</span>
                      <span>Receiver is verifying the payment</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-500 mr-2">•</span>
                      <span>Please wait while we process the transaction</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-500 mr-2">•</span>
                      <span>This will only take a few seconds</span>
                    </li>
                  </ul>
                </div>
              )}
              
              {verificationStatus === "completed" && (
                <div className="bg-emerald-50 rounded-lg p-4">
                  <ul className="text-sm text-emerald-900 space-y-2">
                    <li className="flex items-start">
                      <span className="text-emerald-500 mr-2">•</span>
                      <span>Payment has been verified by the recipient</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-500 mr-2">•</span>
                      <span>Transaction is being recorded on blockchain</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-500 mr-2">•</span>
                      <span>Full amount will be transferred with no fees</span>
                    </li>
                  </ul>
                </div>
              )}
            </motion.div>
            
            <motion.div 
              className="flex space-x-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <Button
                variant="outline"
                className="flex-1 border-gray-300 hover:bg-gray-50 transition-all"
                onClick={onClose}
                disabled={verificationStatus === "verifying"}
              >
                {verificationStatus === "completed" ? "Close" : "Cancel"}
              </Button>
              
              {verificationStatus === "pending" && (
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                  onClick={refreshCode}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Code
                </Button>
              )}
            </motion.div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
