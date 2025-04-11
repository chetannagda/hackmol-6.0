import { useState, useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Info, 
  Shield, 
  AlertTriangle, 
  Globe, 
  ArrowRightLeft, 
  Boxes, 
  Building2 as BankIcon, 
  Coins, 
  Clock, 
  Zap,
  Loader2,
  ArrowRight,
  Check,
  ChevronsRight,
  CircleDollarSign,
  Shuffle,
  Wallet,
  Star,
  ChevronRight,
  BadgePercent,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import SuccessModal from "./SuccessModal";
import SecurityVerification from "./SecurityVerification";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

// Conversion Flow Animation Component
function ConversionFlowAnimation({ 
  fromAmount, 
  fromCurrency, 
  toAmount, 
  toCurrency, 
  onComplete 
}: { 
  fromAmount: number; 
  fromCurrency: string; 
  toAmount: number; 
  toCurrency: string;
  onComplete: () => void;
}) {
  const [step, setStep] = useState(0);
  const [showSourceAmount, setShowSourceAmount] = useState(true);
  const [showTargetAmount, setShowTargetAmount] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  
  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 1500);
    const timer2 = setTimeout(() => {
      setShowSourceAmount(false);
      setTimeout(() => setShowTargetAmount(true), 500);
    }, 2500);
    const timer3 = setTimeout(() => setStep(2), 4000);
    const timer4 = setTimeout(() => setStep(3), 6000);
    const timer5 = setTimeout(() => {
      setShowCheck(true);
      setTimeout(() => onComplete(), 1200);
    }, 8000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [onComplete]);
  
  const steps = [
    {
      title: "Converting Currency",
      description: `Converting ${fromCurrency} to ${toCurrency} via secure exchange`,
      icon: <Shuffle className="h-5 w-5 text-blue-500" />,
    },
    {
      title: "Creating Blockchain Transaction",
      description: "Preparing secure transaction on the blockchain",
      icon: <Boxes className="h-5 w-5 text-indigo-600" />,
    },
    {
      title: "Delivering to Recipient",
      description: `Recipient receives ${toCurrency} in their wallet`,
      icon: <Wallet className="h-5 w-5 text-green-600" />,
    },
    {
      title: "Transaction Complete",
      description: "Your international transfer is complete and verified",
      icon: <Check className="h-5 w-5 text-green-600" />,
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-8 relative">
      {/* Decorative Elements */}
      <motion.div
        className="absolute top-0 right-0 w-20 h-20 rounded-full bg-gradient-to-br from-blue-400/10 to-indigo-500/10 z-0"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 z-0"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          repeatType: "reverse",
          delay: 0.5
        }}
      />
      
      <div className="relative flex items-center justify-center mb-8 w-full max-w-md mx-auto">
        {/* Step 0-1: Currency Conversion Animation */}
        {step < 2 && (
          <div className="flex items-center justify-between w-full max-w-xs mx-auto relative">
            {/* Connecting line */}
            <div className="absolute left-20 right-20 top-1/2 h-0.5 bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 transform -translate-y-1/2 z-0"></div>
            
            <motion.div 
              className="flex flex-col items-center z-10"
              initial={{ opacity: 1 }}
              animate={{ opacity: showSourceAmount ? 1 : 0 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div 
                className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center mb-2 shadow-md relative"
                animate={{
                  boxShadow: [
                    "0 0 0 rgba(59, 130, 246, 0)",
                    "0 0 20px rgba(59, 130, 246, 0.5)",
                    "0 0 0 rgba(59, 130, 246, 0)"
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "loop"
                }}
              >
                <CircleDollarSign className="h-8 w-8 text-blue-600" />
                <motion.div 
                  className="absolute -inset-1 rounded-full border border-blue-400/30"
                  animate={{ 
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                />
              </motion.div>
              <span className="text-sm font-medium text-gray-600">{fromCurrency}</span>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                {fromAmount.toLocaleString()}
              </span>
            </motion.div>
            
            <motion.div
              className="flex flex-col items-center justify-center z-20 bg-white p-3 rounded-full shadow-md"
              animate={{ 
                rotate: [0, 180, 360],
                scale: [1, 1.2, 1],
                background: [
                  "linear-gradient(to right, rgba(255,255,255,1), rgba(255,255,255,1))",
                  "linear-gradient(to right, rgba(238,242,255,1), rgba(224,231,255,1))",
                  "linear-gradient(to right, rgba(255,255,255,1), rgba(255,255,255,1))"
                ]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                repeatType: "loop"
              }}
            >
              <Shuffle className="h-6 w-6 text-indigo-500" />
            </motion.div>
            
            <motion.div 
              className="flex flex-col items-center z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: showTargetAmount ? 1 : 0 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div 
                className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 flex items-center justify-center mb-2 shadow-md relative"
                animate={{
                  boxShadow: [
                    "0 0 0 rgba(99, 102, 241, 0)",
                    "0 0 20px rgba(99, 102, 241, 0.5)",
                    "0 0 0 rgba(99, 102, 241, 0)"
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "loop",
                  delay: 0.5
                }}
              >
                <Coins className="h-8 w-8 text-indigo-600" />
                <motion.div 
                  className="absolute -inset-1 rounded-full border border-indigo-400/30"
                  animate={{ 
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "loop",
                    delay: 0.5
                  }}
                />
              </motion.div>
              <span className="text-sm font-medium text-gray-600">{toCurrency}</span>
              <motion.span 
                className="text-lg font-bold font-mono bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                {toAmount.toFixed(6)}
              </motion.span>
            </motion.div>
          </div>
        )}
        
        {/* Step 2: Blockchain Transfer Animation */}
        {step === 2 && (
          <motion.div 
            className="flex flex-col items-center w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-full bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-5 flex items-center justify-center mb-4 shadow-sm relative overflow-hidden">
              {/* Shimmer animation */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-12"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
              />
              
              <div className="relative w-full max-w-xs">
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div 
                    className="w-3 h-3 rounded-full bg-indigo-600"
                    animate={{ 
                      x: ['-50%', '150%'],
                      scale: [1, 1.5, 1],
                      opacity: [0.2, 1, 0.2],
                      boxShadow: [
                        "0 0 0px rgba(99, 102, 241, 0)",
                        "0 0 10px rgba(99, 102, 241, 0.7)",
                        "0 0 0px rgba(99, 102, 241, 0)"
                      ]
                    }}
                    transition={{ 
                      duration: 1.2,
                      repeat: Infinity,
                      repeatType: "loop" 
                    }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center shadow-md border border-blue-200">
                    <Boxes className="h-7 w-7 text-blue-600" />
                  </div>
                  <div className="border-t-2 border-dashed border-indigo-300 flex-1 mx-3" />
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center shadow-md border border-indigo-200">
                    <Wallet className="h-7 w-7 text-indigo-600" />
                  </div>
                </div>
              </div>
            </div>
            <motion.div 
              className="text-sm text-center text-gray-600 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="font-medium">Securely transferring</span>{" "}
              <span className="font-mono font-semibold text-indigo-700">{toAmount.toFixed(6)} XLM</span>{" "}
              <span className="font-medium">via Stellar blockchain</span>
            </motion.div>
          </motion.div>
        )}
        
        {/* Step 3: Recipient Conversion */}
        {step === 3 && (
          <motion.div 
            className="flex flex-col items-center w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-full max-w-xs mx-auto mb-4">
              <div className="flex items-center justify-between mb-3">
                <motion.div 
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center mb-2 shadow-md border border-indigo-200">
                    <Wallet className="h-8 w-8 text-indigo-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 text-center">Recipient's<br/>Wallet</span>
                </motion.div>
                
                <motion.div 
                  animate={{ 
                    x: [0, 10, 0],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: 3, 
                    repeatType: "loop" 
                  }}
                >
                  <div className="flex flex-col items-center">
                    <div className="py-1 px-3 rounded-full bg-blue-50 border border-blue-100 shadow-sm">
                      <ChevronsRight className="h-5 w-5 text-blue-500" />
                    </div>
                    <span className="text-xs text-gray-500 mt-1">Instant</span>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center mb-2 shadow-md border border-emerald-200">
                    <CircleDollarSign className="h-8 w-8 text-emerald-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 text-center">Ready<br/>for Use</span>
                </motion.div>
              </div>
              
              <motion.div 
                className="bg-gradient-to-r from-indigo-50 to-emerald-50 p-3 rounded-lg shadow-sm text-center relative overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.8 }}
              >
                {/* Shimmer effect */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-12"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
                />
                
                <p className="text-sm text-gray-700 relative z-10">
                  Recipient can now convert <span className="font-semibold text-indigo-700">{toCurrency}</span> to their local currency or use directly
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
        
        {/* Completion Checkmark */}
        {showCheck && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center shadow-lg border border-emerald-200">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              >
                <Check className="h-12 w-12 text-emerald-600" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Steps Progress */}
      <div className="w-full max-w-md mx-auto relative z-10">
        <div className="flex space-x-2 mb-4">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className="relative h-1.5 flex-1 rounded-full overflow-hidden"
            >
              <div className="absolute inset-0 bg-gray-200"></div>
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600"
                initial={{ width: "0%" }}
                animate={{ width: i <= step ? "100%" : "0%" }}
                transition={{ duration: 0.5 }}
              />
            </div>
          ))}
        </div>
        
        <motion.div 
          className="bg-white rounded-xl p-4 border border-indigo-100 shadow-md relative overflow-hidden"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          key={step}
        >
          {/* Subtle gradient pulse */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-indigo-50/50 to-blue-50/50"
            animate={{ 
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse" 
            }}
          />
          
          <h3 className="font-medium text-base flex items-center gap-2 mb-1 relative z-10">
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {steps[step].icon}
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {steps[step].title}
            </motion.span>
          </h3>
          <motion.p 
            className="text-sm text-gray-600 relative z-10 ml-7"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {steps[step].description}
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

// Processing Modal Component
function ProcessingModal({ 
  isOpen, 
  title, 
  message, 
  steps, 
  onCancel 
}: { 
  isOpen: boolean;
  title: string;
  message: string;
  steps: { id: string; label: string; status: "complete" | "processing" | "pending" }[];
  onCancel: () => void;
}) {
  const [showConversionFlow, setShowConversionFlow] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  useEffect(() => {
    if (!isOpen) {
      setShowConversionFlow(false);
      setCurrentStepIndex(0);
      return;
    }
    
    const timer1 = setTimeout(() => setCurrentStepIndex(1), 1500);
    const timer2 = setTimeout(() => setCurrentStepIndex(2), 3000);
    const timer3 = setTimeout(() => {
      setCurrentStepIndex(3);
      setTimeout(() => setShowConversionFlow(true), 800);
    }, 4500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isOpen, steps]);

  const updatedSteps = steps.map((step, index) => ({
    ...step,
    status: index < currentStepIndex 
      ? "complete" 
      : index === currentStepIndex 
        ? "processing" 
        : "pending"
  }));

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md border-0 shadow-2xl rounded-xl overflow-hidden bg-gradient-to-br from-white to-slate-50 p-0">
        {/* Background decorative elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/5 z-0"></div>
        <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-500/10 to-purple-500/5 z-0"></div>
        
        <div className="p-6 relative z-10">
          <DialogHeader className="mb-4">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                {title}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {message}
              </DialogDescription>
            </motion.div>
          </DialogHeader>

          {!showConversionFlow ? (
            <motion.div 
              className="space-y-6 py-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="space-y-4">
                {updatedSteps.map((step, index) => (
                  <motion.div 
                    key={step.id} 
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    {step.status === "complete" ? (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-100 to-emerald-50 flex items-center justify-center shadow-sm border border-green-200">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                    ) : step.status === "processing" ? (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-50 flex items-center justify-center shadow-sm border border-blue-200">
                        <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-slate-50 flex items-center justify-center shadow-sm border border-gray-200">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      </div>
                    )}
                    <motion.span 
                      className={`text-sm font-medium ${
                        step.status === "complete" 
                          ? "text-gray-700" 
                          : step.status === "processing" 
                            ? "text-blue-800" 
                            : "text-gray-500"
                      }`}
                      animate={step.status === "processing" ? {
                        color: ["rgb(30, 64, 175)", "rgb(79, 70, 229)", "rgb(30, 64, 175)"]
                      } : {}}
                      transition={step.status === "processing" ? {
                        duration: 2,
                        repeat: Infinity
                      } : {}}
                    >
                      {step.label}
                    </motion.span>
                    {step.status === "processing" && (
                      <Loader2 className="h-3 w-3 text-blue-600 animate-spin ml-auto" />
                    )}
                  </motion.div>
                ))}
              </div>
              
              <motion.div 
                className="mt-6 p-3 rounded-lg bg-blue-50 border border-blue-100 shadow-inner"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-700">
                    Your transaction is being processed with end-to-end encryption and blockchain verification for maximum security
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <ConversionFlowAnimation
              fromAmount={10000}
              fromCurrency="INR"
              toAmount={0.00123}
              toCurrency="ETH"
              onComplete={onCancel}
            />
          )}

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <DialogFooter className="mt-6">
              <Button 
                variant="outline" 
                onClick={onCancel}
                disabled={showConversionFlow}
                className="bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
              >
                {showConversionFlow ? "Processing..." : "Cancel"}
              </Button>
            </DialogFooter>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Main Component
interface InternationalPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formSchema = z.object({
  transferType: z.enum(["bank", "crypto"]),
  recipientName: z.string().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  swiftCode: z.string().optional(),
  recipientCountry: z.string().optional(),
  walletAddress: z.string().optional(),
  amount: z.number().positive(),
  sourceCurrency: z.string(),
  targetCurrency: z.string(),
  senderId: z.number(),
});

type ConversionResult = {
  fromAmount: number;
  fromCurrency: string;
  toAmount: number;
  toCurrency: string;
  rate: number;
  fee: number;
};

type ComparisonData = {
  bank: {
    fee: number;
    processingTime: string;
    exchangeRate: number;
    amountReceived: number;
  };
  crypto: {
    fee: number;
    processingTime: string;
    exchangeRate: number;
    amountReceived: number;
    gasEstimate?: string;
  };
};

export default function InternationalPaymentModal({ isOpen, onClose }: InternationalPaymentModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showProcessing, setShowProcessing] = useState(false);
  const [showSecurityCheck, setShowSecurityCheck] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [formValues, setFormValues] = useState<z.infer<typeof formSchema> | null>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const rateUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transferType: "bank",
      recipientName: "",
      bankName: "",
      accountNumber: "",
      swiftCode: "",
      recipientCountry: "USA",
      walletAddress: "",
      amount: 0,
      sourceCurrency: "INR",
      targetCurrency: "USD",
      senderId: user?.id || 1,
    },
  });

  const watchAmount = form.watch("amount");
  const watchSourceCurrency = form.watch("sourceCurrency");
  const watchTargetCurrency = form.watch("targetCurrency");
  const watchTransferType = form.watch("transferType");
  const watchWalletAddress = form.watch("walletAddress");

  useEffect(() => {
    const simulateRateUpdates = () => {
      if (rateUpdateInterval.current) {
        clearInterval(rateUpdateInterval.current);
      }

      if (watchAmount && watchAmount > 0) {
        setIsLoadingRates(true);
        
        setTimeout(() => {
          setIsLoadingRates(false);
          updateComparisonData();
          
          // Update rates periodically (every 10 seconds)
          rateUpdateInterval.current = setInterval(() => {
            updateComparisonData();
          }, 10000);
        }, 1500);
      } else {
        setIsLoadingRates(false);
      }
    };

    simulateRateUpdates();

    return () => {
      if (rateUpdateInterval.current) {
        clearInterval(rateUpdateInterval.current);
      }
    };
  }, [watchAmount, watchSourceCurrency, watchTargetCurrency]);

  const updateComparisonData = () => {
    if (watchAmount && watchAmount > 0) {
      try {
        // Fixed rates for demo purposes
        const bankExchangeRate = 82.5;
        const cryptoExchangeRate = 1 / 0.000012; // 1 INR = 0.000012 ETH

        // Bank transfer calculation
        const bankFeePercentage = 0.04; // 4%
        const bankFlatFee = 500; // ₹500 fixed fee
        const bankFee = (watchAmount * bankFeePercentage) + bankFlatFee;
        const bankAmountReceived = (watchAmount - bankFee) / bankExchangeRate;

        // Crypto transfer calculation
        const cryptoFeePercentage = 0.006; // 0.6%
        const cryptoFee = watchAmount * cryptoFeePercentage;
        const cryptoAmountReceived = (watchAmount - cryptoFee) * (1 / cryptoExchangeRate);

        setComparisonData({
          bank: {
            fee: bankFee,
            processingTime: "2-5 business days",
            exchangeRate: bankExchangeRate,
            amountReceived: bankAmountReceived,
          },
          crypto: {
            fee: cryptoFee,
            processingTime: "15 seconds",
            exchangeRate: cryptoExchangeRate,
            amountReceived: cryptoAmountReceived,
            gasEstimate: "0.0001 ETH"
          }
        });

        setConversionResult({
          fromAmount: watchAmount,
          fromCurrency: watchSourceCurrency,
          toAmount: cryptoAmountReceived,
          toCurrency: watchTargetCurrency,
          rate: cryptoExchangeRate,
          fee: cryptoFee
        });
      } catch (error) {
        console.error("Error generating comparison data:", error);
        setComparisonData(null);
      }
    } else {
      setComparisonData(null);
      setConversionResult(null);
    }
  };

  const internationalPaymentMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const transactionId = `tx-${Math.random().toString(36).substring(2, 10)}`;
      let fee = 0;
      let receivedAmount = 0;

      if (values.transferType === "bank") {
        fee = (values.amount * 0.04) + 500;
        receivedAmount = (values.amount - fee) / 82.5;
      } else {
        fee = values.amount * 0.006;
        receivedAmount = (values.amount - fee) * (1 / (1 / 0.000012));
      }

      return {
        transaction: {
          id: transactionId,
          type: values.transferType,
          status: "completed",
          amount: values.amount,
          fee: fee,
          fromCurrency: values.sourceCurrency,
          toCurrency: values.transferType === "bank" ? values.targetCurrency : "ETH",
          receivedAmount: receivedAmount,
          recipient: values.transferType === "bank" ? values.recipientName : values.walletAddress,
          processingTime: values.transferType === "bank" ? "2-5 business days" : "15 seconds",
          createdAt: new Date().toISOString(),
        }
      };
    },
    onSuccess: (data) => {
      setTransactionDetails(data.transaction);
      
      // Update user balance in the UI
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}`] });
      
      toast({
        title: "International Transfer Complete",
        description: `Your payment of ₹${formValues?.amount.toLocaleString()} has been processed.`,
        icon: <Globe className="h-4 w-4 text-green-500" />,
      });

      setShowProcessing(false);
      setShowSuccess(true);
    },
    onError: () => {
      setShowProcessing(false);
      toast({
        variant: "destructive",
        title: "Transfer Failed",
        description: "An error occurred while processing your transfer. Please try again.",
        icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
      });
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setFormValues(values);
    
    // Skip security check for small amounts
    if (values.amount < 5000) {
      setShowProcessing(true);
      internationalPaymentMutation.mutate(values);
    } else {
      setShowSecurityCheck(true);
    }
  };

  const handleSecurityVerificationComplete = (success: boolean) => {
    setShowSecurityCheck(false);

    if (success && formValues) {
      setShowProcessing(true);
      internationalPaymentMutation.mutate(formValues);
    } else {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: "Security verification was not completed successfully.",
        icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
      });
    }
  };

  const closeAll = () => {
    setShowProcessing(false);
    setShowSecurityCheck(false);
    setShowSuccess(false);
    setFormValues(null);
    form.reset();
    onClose();
  };

  const isHighAmount = formValues?.amount ? formValues.amount >= 15000 : false;

  return (
    <>
      <Dialog open={isOpen && !showProcessing && !showSecurityCheck && !showSuccess} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-auto p-0 border-0 shadow-2xl bg-gradient-to-br from-white to-slate-50 rounded-xl">
          {/* Background decorative elements */}
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/5 z-0"></div>
          <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-500/10 to-purple-500/5 z-0"></div>
          
          <div className="relative z-10 p-6">
            <DialogHeader className="sticky top-0 bg-transparent pb-4">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Badge className="mb-2 bg-gradient-to-r from-indigo-600/90 to-blue-600/90 hover:from-indigo-600 hover:to-blue-600 text-white border-0 px-3 py-1 shadow-sm">
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  Global Transfers
                </Badge>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent flex items-center gap-2">
                  <Globe className="h-6 w-6 text-blue-600" />
                  International Money Transfer
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Send money globally via traditional bank transfer or secure blockchain technology
                </DialogDescription>
              </motion.div>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <motion.div 
                  className="space-y-2 pt-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <FormLabel className="text-base font-medium text-gray-900">Transfer Method</FormLabel>
                  <FormField
                    control={form.control}
                    name="transferType"
                    render={({ field }) => (
                      <FormItem>
                        <Tabs
                          value={field.value}
                          onValueChange={field.onChange}
                          className="w-full"
                        >
                          <TabsList className="grid grid-cols-2 w-full h-auto p-1 bg-gray-100/80 backdrop-blur-sm">
                            <TabsTrigger 
                              value="bank" 
                              className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-md transition-all"
                            >
                              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${field.value === "bank" ? "bg-slate-100" : "bg-transparent"}`}>
                                <BankIcon className={`h-4.5 w-4.5 ${field.value === "bank" ? "text-gray-800" : "text-gray-600"}`} />
                              </div>
                              <div className="flex flex-col items-start">
                                <span className={field.value === "bank" ? "font-medium" : ""}>Bank Transfer</span>
                                <span className="text-xs text-gray-500">Traditional banking</span>
                              </div>
                            </TabsTrigger>
                            <TabsTrigger 
                              value="crypto" 
                              className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-md transition-all"
                            >
                              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${field.value === "crypto" ? "bg-blue-100" : "bg-transparent"}`}>
                                <Coins className={`h-4.5 w-4.5 ${field.value === "crypto" ? "text-blue-600" : "text-gray-600"}`} />
                              </div>
                              <div className="flex flex-col items-start">
                                <span className={field.value === "crypto" ? "font-medium" : ""}>Crypto Transfer</span>
                                <span className="text-xs text-gray-500">Blockchain secured</span>
                              </div>
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="bank" className="space-y-4 mt-5 pt-1">
                            <motion.div 
                              className="bg-gradient-to-r from-slate-50 to-gray-50 p-3 rounded-lg border border-gray-200"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: 0.1 }}
                            >
                              <div className="flex items-start gap-2">
                                <BankIcon className="h-4 w-4 text-slate-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-sm text-slate-800 font-medium">Powered by Wise (TransferWise)</p>
                                  <p className="text-xs text-slate-600 mt-0.5">
                                    International bank transfers processed through Wise's secure global network
                                  </p>
                                </div>
                              </div>
                            </motion.div>

                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="recipientName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-700">Recipient Name</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="Full name" 
                                        {...field} 
                                        className="border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 py-5 px-4 rounded-lg shadow-sm"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="bankName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-700">Bank Name</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="Recipient's bank" 
                                        {...field} 
                                        className="border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 py-5 px-4 rounded-lg shadow-sm"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="accountNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-700">Account Number</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="Bank account number" 
                                        {...field} 
                                        className="border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 py-5 px-4 rounded-lg shadow-sm"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="swiftCode"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-700">SWIFT/BIC Code</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="International bank code" 
                                        {...field} 
                                        className="border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 py-5 px-4 rounded-lg shadow-sm"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={form.control}
                              name="recipientCountry"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-700">Recipient Country</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 py-5 px-4 rounded-lg shadow-sm">
                                        <SelectValue placeholder="Select country" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="USA">United States</SelectItem>
                                      <SelectItem value="UK">United Kingdom</SelectItem>
                                      <SelectItem value="CA">Canada</SelectItem>
                                      <SelectItem value="AU">Australia</SelectItem>
                                      <SelectItem value="EU">European Union</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TabsContent>

                          <TabsContent value="crypto" className="space-y-4 mt-5 pt-1">
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <FormField
                                control={form.control}
                                name="walletAddress"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-700">Recipient's Wallet Address</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="0x... or G..." 
                                        {...field} 
                                        className="border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 py-5 px-4 rounded-lg shadow-sm font-mono"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                    <div className="flex mt-2 items-center">
                                      <div className="p-2 bg-blue-50 rounded-lg mr-2">
                                        <Shield className="h-4 w-4 text-blue-600" />
                                      </div>
                                      <p className="text-xs text-gray-600">
                                        Enter a Stellar (XLM) wallet address starting with "G"
                                      </p>
                                    </div>
                                  </FormItem>
                                )}
                              />
                            </motion.div>
                            
                            <motion.div 
                              className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: 0.1 }}
                            >
                              <div className="flex items-start gap-2">
                                <Zap className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-sm text-blue-800 font-medium">Stellar (XLM) Blockchain Transfer</p>
                                  <p className="text-xs text-blue-700 mt-0.5">
                                    Fast and low-cost transfers processed instantly on the Stellar network
                                  </p>
                                  <div className="flex items-center mt-2">
                                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">
                                      <TrendingUp className="h-3 w-3 mr-1" />
                                      3-5 second settlement
                                    </Badge>
                                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 ml-2">
                                      <BadgePercent className="h-3 w-3 mr-1" />
                                      Minimal fees
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </TabsContent>
                        </Tabs>
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div 
                  className="grid grid-cols-3 gap-4 pt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Amount</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                            <Input
                              type="number"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              className="border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 pl-8 py-5 px-4 rounded-lg shadow-sm"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sourceCurrency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">From Currency</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 py-5 px-4 rounded-lg shadow-sm">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                            <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="targetCurrency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">To Currency</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 py-5 px-4 rounded-lg shadow-sm">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                            <SelectItem value="GBP">GBP - British Pound</SelectItem>
                            <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                {comparisonData && (
                  <motion.div 
                    className="mt-6 pt-4 border-t border-gray-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <ArrowRightLeft className="h-5 w-5 text-blue-600" />
                      Transfer Method Comparison
                      {isLoadingRates && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                      )}
                    </h3>
                    
                    <div className="overflow-hidden rounded-xl border border-indigo-100 shadow-sm bg-white">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600">Feature</th>
                            <th className="py-3 px-4 text-left">
                              <div className="flex items-center gap-1.5">
                                <div className="bg-slate-100 rounded-full p-1">
                                  <BankIcon className="h-3.5 w-3.5 text-slate-600" />
                                </div>
                                <span className="text-xs font-semibold text-gray-700">Bank Transfer</span>
                              </div>
                            </th>
                            <th className="py-3 px-4 text-left">
                              <div className="flex items-center gap-1.5">
                                <div className="bg-blue-100 rounded-full p-1">
                                  <Coins className="h-3.5 w-3.5 text-blue-600" />
                                </div>
                                <span className="text-xs font-semibold text-gray-700">Stellar XLM Transfer</span>
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          <tr>
                            <td className="py-3 px-4 text-xs font-medium text-gray-600">Speed</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-amber-600" />
                                <span className="text-sm">{comparisonData.bank.processingTime}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <Zap className="h-3.5 w-3.5 text-green-600" />
                                <span className="text-sm font-medium text-green-700">{comparisonData.crypto.processingTime}</span>
                              </div>
                            </td>
                          </tr>
                          
                          <tr className="bg-gray-50/50">
                            <td className="py-3 px-4 text-xs font-medium text-gray-600">Fee</td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-red-600 font-medium">
                                ₹{comparisonData.bank.fee.toLocaleString('en-IN')}
                              </span>
                              <span className="text-xs text-gray-500 ml-1">
                                (4% + ₹500 flat fee)
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200">
                                <BadgePercent className="h-3 w-3 mr-1" />
                                0.6% (₹{comparisonData.crypto.fee.toLocaleString('en-IN')})
                              </Badge>
                            </td>
                          </tr>
                          
                          <tr>
                            <td className="py-3 px-4 text-xs font-medium text-gray-600">Exchange Rate</td>
                            <td className="py-3 px-4">
                              <div className="flex flex-col">
                                <span className="text-sm">₹1 = ${(1/comparisonData.bank.exchangeRate).toFixed(4)} USD</span>
                                <span className="text-xs text-amber-600">(includes bank markup)</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-mono">₹1 = {(1/comparisonData.crypto.exchangeRate).toFixed(6)} ETH</span>
                                <span className="text-xs text-green-600 flex items-center">
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  Real-time market rate
                                </span>
                              </div>
                            </td>
                          </tr>
                          
                          <tr className="bg-gray-50/50">
                            <td className="py-3 px-4 text-xs font-medium text-gray-600">Transparency</td>
                            <td className="py-3 px-4">
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200">
                                Limited visibility
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200 flex items-center">
                                <Boxes className="h-3 w-3 mr-1" />
                                Full on-chain verification
                              </Badge>
                            </td>
                          </tr>
                          
                          <tr>
                            <td className="py-3 px-4 text-xs font-medium text-gray-600">Amount Received</td>
                            <td className="py-3 px-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-green-600">
                                  ${comparisonData.bank.amountReceived.toFixed(2)} USD
                                </span>
                                <span className="text-xs text-gray-500">
                                  (₹{watchAmount.toLocaleString('en-IN')} - ₹{comparisonData.bank.fee.toLocaleString('en-IN')} fees)
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-green-600">
                                  {comparisonData.crypto.amountReceived.toFixed(6)} ETH
                                </span>
                                <span className="text-xs text-gray-500">
                                  (₹{watchAmount.toLocaleString('en-IN')} - ₹{comparisonData.crypto.fee.toLocaleString('en-IN')} fees)
                                </span>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-3 flex items-start gap-1.5">
                      <Info className="h-3.5 w-3.5 text-gray-500 flex-shrink-0 mt-0.5" />
                      <span>
                        All fees shown in Indian Rupees (₹). Exchange rates are fixed for demo purposes.
                        Cryptocurrency transfers use a flat 0.6% fee vs. bank fees of 4% plus ₹500 fixed charge.
                      </span>
                    </div>
                  </motion.div>
                )}

                <motion.div 
                  className="flex justify-end space-x-2 pt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-indigo-600 to-blue-700"
                    disabled={!watchAmount || watchAmount <= 0}
                  >
                    {form.watch("transferType") === "bank" ? "Send via Wise" : "Send via Stellar XLM"}
                  </Button>
                </motion.div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSecurityCheck} onOpenChange={() => setShowSecurityCheck(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Security Verification</DialogTitle>
          </DialogHeader>

          <SecurityVerification
            onVerificationComplete={handleSecurityVerificationComplete}
            action={formValues?.transferType === "bank" ? "Bank Transfer" : "Blockchain Transfer"}
            amount={formValues?.amount}
            recipient={formValues?.transferType === "bank" ? formValues?.recipientName : formValues?.walletAddress}
            highSecurity={isHighAmount}
          />
        </DialogContent>
      </Dialog>

      <ProcessingModal
        isOpen={showProcessing}
        title={formValues?.transferType === "bank"
          ? "Processing Bank Transfer"
          : "Processing Blockchain Transfer"
        }
        message={formValues?.transferType === "bank"
          ? "Initiating international bank transfer..."
          : "Converting currency and preparing secure blockchain transaction..."
        }
        steps={formValues?.transferType === "bank" ? [
          { id: "validate", label: "Validating bank details", status: "complete" },
          { id: "security", label: "Running security checks", status: "processing" },
          { id: "convert", label: "Converting currency via Wise", status: "pending" },
          { id: "process", label: "Preparing bank transfer", status: "pending" },
        ] : [
          { id: "validate", label: "Validating Stellar wallet address", status: "complete" },
          { id: "security", label: "Running blockchain security check", status: "processing" },
          { id: "convert", label: "Converting to XLM cryptocurrency", status: "pending" },
          { id: "blockchain", label: "Creating Stellar transaction", status: "pending" },
        ]}
        onCancel={closeAll}
      />

      <SuccessModal
        isOpen={showSuccess}
        transaction={transactionDetails}
        onClose={closeAll}
      />
    </>
  );
}