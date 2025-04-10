// import { useState, useEffect, useRef } from "react";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from "@/components/ui/dialog";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { 
//   Info, 
//   Shield, 
//   AlertTriangle, 
//   Globe, 
//   ArrowRightLeft, 
//   Boxes, 
//   Building2 as BankIcon, 
//   Coins, 
//   Clock, 
//   Zap, 
//   Loader2,
//   ArrowRight,
//   Check,
//   ChevronsRight,
//   CircleDollarSign,
//   Shuffle,
//   Wallet
// } from "lucide-react";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { z } from "zod";
// import { useMutation } from "@tanstack/react-query";
// import { apiRequest } from "@/lib/queryClient";
// import { useAuth } from "@/context/AuthContext";
// import { useToast } from "@/hooks/use-toast";
// import { formatCurrency } from "@/lib/utils";
// import { convertCurrency, estimateGas } from "@/lib/ethereum";
// import SuccessModal from "./SuccessModal";
// import SecurityVerification from "./SecurityVerification";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
// import { AnimatePresence, motion } from "framer-motion";

// // Add this component before the main InternationalPaymentModal component
// function ConversionFlowAnimation({ 
//   fromAmount, 
//   fromCurrency, 
//   toAmount, 
//   toCurrency, 
//   onComplete 
// }: { 
//   fromAmount: number; 
//   fromCurrency: string; 
//   toAmount: number; 
//   toCurrency: string;
//   onComplete: () => void;
// }) {
//   const [step, setStep] = useState(0);
//   const [showSourceAmount, setShowSourceAmount] = useState(true);
//   const [showTargetAmount, setShowTargetAmount] = useState(false);
//   const [showCheck, setShowCheck] = useState(false);
  
//   useEffect(() => {
//     // Step 0: Initial state - show source amount
//     const timer1 = setTimeout(() => setStep(1), 2000);
    
//     // Step 1: Show conversion animation
//     const timer2 = setTimeout(() => {
//       setShowSourceAmount(false);
//       setTimeout(() => setShowTargetAmount(true), 600);
//     }, 3000);
    
//     // Step 2: Show blockchain transfer
//     const timer3 = setTimeout(() => setStep(2), 5000);
    
//     // Step 3: Show wallet to recipient conversion
//     const timer4 = setTimeout(() => setStep(3), 8000);
    
//     // Step 4: Show completion check
//     const timer5 = setTimeout(() => {
//       setShowCheck(true);
//       setTimeout(() => onComplete(), 1500);
//     }, 10000);
    
//     return () => {
//       clearTimeout(timer1);
//       clearTimeout(timer2);
//       clearTimeout(timer3);
//       clearTimeout(timer4);
//       clearTimeout(timer5);
//     };
//   }, [onComplete]);
  
//   const steps = [
//     {
//       title: "Converting Currency",
//       description: `Converting ${fromCurrency} to ${toCurrency} via secure exchange`,
//       icon: <Shuffle className="h-5 w-5 text-blue-500" />,
//     },
//     {
//       title: "Creating Blockchain Transaction",
//       description: "Preparing secure transaction on the blockchain",
//       icon: <Boxes className="h-5 w-5 text-indigo-600" />,
//     },
//     {
//       title: "Delivering to Recipient",
//       description: `Recipient receives ${toCurrency} in their wallet`,
//       icon: <Wallet className="h-5 w-5 text-green-600" />,
//     },
//     {
//       title: "Transaction Complete",
//       description: "Your international transfer is complete and verified",
//       icon: <Check className="h-5 w-5 text-green-600" />,
//     },
//   ];

//   return (
//     <div className="flex flex-col items-center justify-center py-8">
//       <div className="relative flex items-center justify-center mb-8 w-full max-w-md mx-auto">
//         {/* Step 0-1: Currency Conversion Animation */}
//         {step < 2 && (
//           <div className="flex items-center justify-between w-full max-w-xs mx-auto">
//             <motion.div 
//               className="flex flex-col items-center"
//               initial={{ opacity: 1 }}
//               animate={{ opacity: showSourceAmount ? 1 : 0 }}
//               transition={{ duration: 0.5 }}
//             >
//               <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-2">
//                 <CircleDollarSign className="h-8 w-8 text-blue-600" />
//               </div>
//               <span className="text-sm font-medium">{fromCurrency}</span>
//               <span className="text-lg font-bold">{fromAmount.toLocaleString()}</span>
//             </motion.div>
            
//             <motion.div
//               className="flex flex-col items-center justify-center"
//               animate={{ 
//                 rotate: [0, 180, 360],
//                 scale: [1, 1.2, 1],
//               }}
//               transition={{ 
//                 duration: 2, 
//                 repeat: Infinity,
//                 repeatType: "loop"
//               }}
//             >
//               <Shuffle className="h-6 w-6 text-indigo-500" />
//             </motion.div>
            
//             <motion.div 
//               className="flex flex-col items-center"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: showTargetAmount ? 1 : 0 }}
//               transition={{ duration: 0.5 }}
//             >
//               <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
//                 <Coins className="h-8 w-8 text-indigo-600" />
//               </div>
//               <span className="text-sm font-medium">{toCurrency}</span>
//               <span className="text-lg font-bold">
//                 {toAmount.toFixed(6)}
//               </span>
//             </motion.div>
//           </div>
//         )}
        
//         {/* Step 2: Blockchain Transfer Animation */}
//         {step === 2 && (
//           <motion.div 
//             className="flex flex-col items-center w-full"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//           >
//             <div className="w-full bg-indigo-50 rounded-xl p-4 flex items-center justify-center mb-4">
//               <div className="relative w-full max-w-xs">
//                 <div className="absolute inset-0 flex items-center justify-center">
//                   <motion.div 
//                     className="w-2 h-2 rounded-full bg-indigo-600"
//                     animate={{ 
//                       x: ['-50%', '150%'],
//                       scale: [1, 1.5, 1],
//                       opacity: [0.2, 1, 0.2]
//                     }}
//                     transition={{ 
//                       duration: 1.5,
//                       repeat: Infinity,
//                       repeatType: "loop" 
//                     }}
//                   />
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
//                     <Boxes className="h-6 w-6 text-blue-600" />
//                   </div>
//                   <div className="border-t-2 border-dashed border-indigo-300 flex-1 mx-2" />
//                   <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
//                     <Wallet className="h-6 w-6 text-indigo-600" />
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <div className="text-sm text-center text-muted-foreground">
//               Securely transferring {toAmount.toFixed(6)} {toCurrency} via blockchain
//             </div>
//           </motion.div>
//         )}
        
//         {/* Step 3: Recipient Conversion */}
//         {step === 3 && (
//           <motion.div 
//             className="flex flex-col items-center w-full"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//           >
//             <div className="flex items-center justify-between w-full max-w-xs mx-auto mb-4">
//               <motion.div 
//                 className="flex flex-col items-center"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ duration: 0.5, delay: 0.2 }}
//               >
//                 <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center mb-1">
//                   <Wallet className="h-7 w-7 text-indigo-600" />
//                 </div>
//                 <span className="text-xs font-medium">Recipient's Wallet</span>
//               </motion.div>
              
//               <motion.div 
//                 animate={{ x: [0, 10, 0] }}
//                 transition={{ duration: 1, repeat: 3 }}
//               >
//                 <ChevronsRight className="h-5 w-5 text-muted-foreground" />
//               </motion.div>
              
//               <motion.div 
//                 className="flex flex-col items-center"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ duration: 0.5, delay: 0.8 }}
//               >
//                 <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-1">
//                   <CircleDollarSign className="h-7 w-7 text-green-600" />
//                 </div>
//                 <span className="text-xs font-medium">Ready for Use</span>
//               </motion.div>
//             </div>
//             <div className="text-sm text-center text-muted-foreground">
//               Recipient can now convert {toCurrency} to their local currency or use directly
//             </div>
//           </motion.div>
//         )}
        
//         {/* Completion Checkmark */}
//         {showCheck && (
//           <motion.div 
//             className="absolute inset-0 flex items-center justify-center"
//             initial={{ scale: 0, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ type: "spring", stiffness: 200, damping: 20 }}
//           >
//             <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
//               <Check className="h-10 w-10 text-green-600" />
//             </div>
//           </motion.div>
//         )}
//       </div>
      
//       {/* Steps Progress */}
//       <div className="w-full max-w-md mx-auto">
//         <div className="flex space-x-2 mb-4">
//           {steps.map((_, i) => (
//             <div 
//               key={i} 
//               className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-blue-600' : 'bg-gray-200'}`}
//             />
//           ))}
//         </div>
        
//         <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 border">
//           <h3 className="font-medium text-sm flex items-center gap-2 mb-1">
//             {steps[step].icon}
//             {steps[step].title}
//           </h3>
//           <p className="text-sm text-muted-foreground">{steps[step].description}</p>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Update the existing ProcessingModal component to include conversion animation
// function ProcessingModal({ 
//   isOpen, 
//   title, 
//   message, 
//   steps, 
//   onCancel 
// }: { 
//   isOpen: boolean;
//   title: string;
//   message: string;
//   steps: { id: string; label: string; status: "complete" | "processing" | "pending" }[];
//   onCancel: () => void;
// }) {
//   const [showConversionFlow, setShowConversionFlow] = useState(false);
//   const [conversionCompleted, setConversionCompleted] = useState(false);
//   const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
//   useEffect(() => {
//     if (!isOpen) {
//       setShowConversionFlow(false);
//       setConversionCompleted(false);
//       setCurrentStepIndex(0);
//       return;
//     }
    
//     // Initialize first step as processing
//     const timer1 = setTimeout(() => {
//       setCurrentStepIndex(1);
      
//       // Complete security check after 2 seconds
//       const timer2 = setTimeout(() => {
//         setCurrentStepIndex(2);
        
//         // Start conversion after 2 more seconds
//         const timer3 = setTimeout(() => {
//           setCurrentStepIndex(3);
          
//           // Show conversion flow animation after 1 more second
//           const timer4 = setTimeout(() => {
//             setShowConversionFlow(true);
//           }, 1000);
          
//           return () => clearTimeout(timer4);
//         }, 2000);
        
//         return () => clearTimeout(timer3);
//       }, 2000);
      
//       return () => clearTimeout(timer2);
//     }, 2000);
    
//     return () => clearTimeout(timer1);
//   }, [isOpen, steps]);
  
//   const handleConversionComplete = () => {
//     setConversionCompleted(true);
//     onCancel();
//   };
  
//   // Update steps based on currentStepIndex
//   const updatedSteps = steps.map((step, index) => ({
//     ...step,
//     status: index < currentStepIndex 
//       ? "complete" 
//       : index === currentStepIndex 
//         ? "processing" 
//         : "pending"
//   }));

//   return (
//     <Dialog open={isOpen} onOpenChange={onCancel}>
//       <DialogContent className="sm:max-w-md">
//         <DialogHeader>
//           <DialogTitle>{title}</DialogTitle>
//           <DialogDescription>{message}</DialogDescription>
//         </DialogHeader>

//         {!showConversionFlow ? (
//           <div className="space-y-6 py-4">
//             <div className="space-y-4">
//               {updatedSteps.map((step) => (
//                 <div key={step.id} className="flex items-center gap-3">
//                   {step.status === "complete" ? (
//                     <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
//                       <Check className="h-3.5 w-3.5 text-green-600" />
//                     </div>
//                   ) : step.status === "processing" ? (
//                     <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
//                       <Loader2 className="h-3.5 w-3.5 text-blue-600 animate-spin" />
//                     </div>
//                   ) : (
//                     <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
//                       <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
//                     </div>
//                   )}
//                   <span className="text-sm">{step.label}</span>
//                   {step.status === "processing" && (
//                     <Loader2 className="h-3 w-3 text-muted-foreground animate-spin ml-auto" />
//                   )}
//                 </div>
//               ))}
//             </div>
            
//             <div className="mt-6 text-xs text-muted-foreground">
//               This process is secure and encrypted. Your transaction details are protected.
//             </div>
//           </div>
//         ) : (
//           <ConversionFlowAnimation
//             fromAmount={10000}
//             fromCurrency="INR"
//             toAmount={0.00123}
//             toCurrency="ETH"
//             onComplete={handleConversionComplete}
//           />
//         )}

//         <DialogFooter>
//           <Button 
//             variant="outline" 
//             onClick={onCancel}
//             disabled={showConversionFlow && !conversionCompleted}
//           >
//             {showConversionFlow ? "Processing..." : "Cancel"}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

// interface InternationalPaymentModalProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// const formSchema = z.object({
//   transferType: z.enum(["bank", "crypto"]),
//   recipientName: z.string().optional(),
//   bankName: z.string().optional(),
//   accountNumber: z.string().optional(),
//   swiftCode: z.string().optional(),
//   recipientCountry: z.string().optional(),
//   walletAddress: z.string().optional(),
//   amount: z.number().positive(),
//   sourceCurrency: z.string(),
//   targetCurrency: z.string(),
//   senderId: z.number(),
// });

// type ConversionResult = {
//   fromAmount: number;
//   fromCurrency: string;
//   toAmount: number;
//   toCurrency: string;
//   rate: number;
//   fee: number;
// };

// type ComparisonData = {
//   bank: {
//     fee: number;
//     processingTime: string;
//     exchangeRate: number;
//     amountReceived: number;
//   };
//   crypto: {
//     fee: number;
//     processingTime: string;
//     exchangeRate: number;
//     amountReceived: number;
//     gasEstimate?: string;
//   };
// };

// export default function InternationalPaymentModal({ isOpen, onClose }: InternationalPaymentModalProps) {
//   const { user, analyzeSecurity } = useAuth();
//   const { toast } = useToast();

//   const [showProcessing, setShowProcessing] = useState(false);
//   const [showSecurityCheck, setShowSecurityCheck] = useState(false);
//   const [showSuccess, setShowSuccess] = useState(false);
//   const [transactionDetails, setTransactionDetails] = useState<any>(null);
//   const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
//   const [formValues, setFormValues] = useState<z.infer<typeof formSchema> | null>(null);
//   const [gasEstimate, setGasEstimate] = useState<string | null>(null);
//   const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
//   const [isLoadingRates, setIsLoadingRates] = useState(false);
//   const [exchangeRateVariation, setExchangeRateVariation] = useState(0);
//   const rateUpdateInterval = useRef<NodeJS.Timeout | null>(null);

//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       transferType: "bank",
//       recipientName: "",
//       bankName: "",
//       accountNumber: "",
//       swiftCode: "",
//       recipientCountry: "USA",
//       walletAddress: "",
//       amount: 0,
//       sourceCurrency: "INR",
//       targetCurrency: "USD",
//       senderId: user?.id,
//     },
//   });

//   const watchAmount = form.watch("amount");
//   const watchSourceCurrency = form.watch("sourceCurrency");
//   const watchTargetCurrency = form.watch("targetCurrency");
//   const watchTransferType = form.watch("transferType");
//   const watchWalletAddress = form.watch("walletAddress");

//   useEffect(() => {
//     const simulateRateUpdates = () => {
//       if (rateUpdateInterval.current) {
//         clearInterval(rateUpdateInterval.current);
//       }

//       if (watchAmount && watchAmount > 0) {
//         setIsLoadingRates(true);
        
//         // Longer initial loading to seem more realistic
//         setTimeout(() => {
//           setIsLoadingRates(false);
          
//           // Set initial rate with no variation
//           setExchangeRateVariation(0);
          
//           // Add a small delay before starting the animation
//           setTimeout(() => {
//             // Generate a very small random variation (-0.05% to +0.05%)
//             const initialVariation = (Math.random() * 0.001) - 0.0005;
            
//             // Use requestAnimationFrame for smoother updates
//             requestAnimationFrame(() => {
//               setExchangeRateVariation(initialVariation);
//             });
            
//             // Start the interval for future updates (much slower - 8-12 seconds)
//             rateUpdateInterval.current = setInterval(() => {
//               // Generate very small incremental change
//               const delta = (Math.random() * 0.0008) - 0.0004;
              
//               // Use requestAnimationFrame for smoother updates
//               requestAnimationFrame(() => {
//                 setExchangeRateVariation(prev => {
//                   // New variation (keep within reasonable bounds)
//                   let newVariation = prev + delta;
//                   if (newVariation > 0.003) newVariation = 0.003;
//                   if (newVariation < -0.003) newVariation = -0.003;
                  
//                   return newVariation;
//                 });
//               });
//             }, 8000 + Math.random() * 4000); // Random interval between 8-12 seconds
//           }, 2000);
//         }, 2500);
//       } else {
//         setIsLoadingRates(false);
//         setExchangeRateVariation(0);
//       }
//     };

//     simulateRateUpdates();

//     return () => {
//       if (rateUpdateInterval.current) {
//         clearInterval(rateUpdateInterval.current);
//       }
//     };
//   }, [watchAmount, watchSourceCurrency, watchTargetCurrency]);

//   useEffect(() => {
//     const updateComparisonData = async () => {
//       if (watchAmount && watchAmount > 0) {
//         try {
//           const bankFeePercentage = 0.04;
//           const bankFlatFee = 500;
//           const bankExchangeRate = 82.5 * (1 + exchangeRateVariation);
//           const bankFee = (watchAmount * bankFeePercentage) + bankFlatFee;
//           const bankAmountReceived = (watchAmount - bankFee) / bankExchangeRate;

//           const cryptoFeePercentage = 0.006;
//           const cryptoFee = watchAmount * cryptoFeePercentage;
//           const mockCryptoRate = 0.000012 * (1 + exchangeRateVariation * 2);
//           const cryptoExchangeRate = 1 / mockCryptoRate;
//           const cryptoAmountReceived = (watchAmount - cryptoFee) * mockCryptoRate;

//           const cryptoResult: ConversionResult = {
//             fromAmount: watchAmount,
//             fromCurrency: watchSourceCurrency,
//             toAmount: cryptoAmountReceived,
//             toCurrency: 'ETH',
//             rate: cryptoExchangeRate,
//             fee: cryptoFee
//           };

//           setComparisonData({
//             bank: {
//               fee: bankFee,
//               processingTime: "2-5 business days",
//               exchangeRate: bankExchangeRate,
//               amountReceived: bankAmountReceived,
//             },
//             crypto: {
//               fee: cryptoFee,
//               processingTime: "~15 seconds",
//               exchangeRate: cryptoExchangeRate,
//               amountReceived: cryptoAmountReceived,
//               gasEstimate: gasEstimate || "12-20 Gwei"
//             }
//           });

//           setConversionResult(cryptoResult);
//         } catch (error) {
//           console.error("Error generating comparison data:", error);
//           setComparisonData(null);
//         }
//       } else {
//         setComparisonData(null);
//         setConversionResult(null);
//       }
//     };

//     updateComparisonData();
//   }, [watchAmount, watchSourceCurrency, watchTargetCurrency, gasEstimate, exchangeRateVariation]);

//   useEffect(() => {
//     const updateGasEstimate = async () => {
//       if (watchWalletAddress &&
//           watchAmount > 0 &&
//           watchTransferType === "crypto" &&
//           watchWalletAddress.startsWith('0x') &&
//           watchWalletAddress.length === 42) {
//         try {
//           const estimatedAmount = conversionResult?.toAmount || 0.01;
//           const gasEstimateValue = await estimateGas(watchWalletAddress, estimatedAmount.toString());
//           setGasEstimate(gasEstimateValue);
//         } catch (error) {
//           console.error("Error estimating gas:", error);
//           setGasEstimate(null);
//         }
//       } else {
//         setGasEstimate(null);
//       }
//     };

//     updateGasEstimate();
//   }, [watchWalletAddress, watchAmount, watchTransferType, conversionResult]);

//   const internationalPaymentMutation = useMutation({
//     mutationFn: async (values: z.infer<typeof formSchema>) => {
//       console.log("Mock API call with values:", values);
//       await new Promise(resolve => setTimeout(resolve, 2000));
//       const transactionId = "tx-" + Math.random().toString(36).substring(2, 10);
//       let fee = 0;
//       if (values.transferType === "bank") {
//         const bankFeePercentage = 0.04;
//         fee = (values.amount * bankFeePercentage) + 500;
//       } else {
//         const cryptoFeePercentage = 0.006;
//         fee = values.amount * cryptoFeePercentage;
//       }

//       return {
//         transaction: {
//           id: transactionId,
//           type: values.transferType,
//           status: "pending",
//           amount: values.amount,
//           fee: fee,
//           fromCurrency: values.sourceCurrency,
//           toCurrency: values.transferType === "bank" ? values.targetCurrency : "ETH",
//           recipient: values.transferType === "bank" ? values.recipientName : values.walletAddress,
//           accountNumber: values.accountNumber,
//           bankName: values.bankName,
//           swiftCode: values.swiftCode,
//           recipientCountry: values.recipientCountry,
//           processingTime: values.transferType === "bank" ? "2-5 business days" : "~15 seconds",
//           createdAt: new Date().toISOString(),
//           estimatedArrival: values.transferType === "bank" 
//             ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
//             : new Date(Date.now() + 2 * 60 * 1000).toISOString(),
//         }
//       };
//     },
//     onSuccess: (data) => {
//       setTransactionDetails(data.transaction);
//       // Don't immediately hide and show success - ProcessingModal will handle this
//       setShowSuccess(true);
      
//       toast({
//         title: `International Transfer Complete`,
//         description: formValues?.transferType === "bank"
//           ? `Your bank transfer has been completed. Funds will arrive in 2-5 business days.`
//           : `Your ${watchSourceCurrency} has been converted and sent via blockchain. Transaction confirmed.`,
//         icon: <Shield className="h-4 w-4 text-green-500" />,
//       });
//     },
//     onError: (error) => {
//       setShowProcessing(false);
//       toast({
//         variant: "destructive",
//         title: "Transfer Failed",
//         description: error instanceof Error ? error.message : "An unexpected error occurred",
//         icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
//       });
//     },
//   });

//   const onSubmit = async (values: z.infer<typeof formSchema>) => {
//     setFormValues(values);
//     setShowSecurityCheck(true);
//   };

//   const handleSecurityVerificationComplete = (success: boolean) => {
//     setShowSecurityCheck(false);

//     if (success && formValues) {
//       setShowProcessing(true);
//       setTimeout(() => {
//         internationalPaymentMutation.mutate(formValues);
//       }, 800);
//     } else if (!success) {
//       toast({
//         variant: "destructive",
//         title: "Transaction Blocked",
//         description: "This international transfer was automatically blocked due to suspicious activity. Your funds are safe.",
//         icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
//       });
//     }
//   };

//   const closeAll = () => {
//     setShowProcessing(false);
//     setShowSecurityCheck(false);
//     setShowSuccess(false);
//     setFormValues(null);
//     form.reset();
//     onClose();
//   };

//   const isHighAmount = formValues?.amount ? formValues.amount >= 15000 : false;

//   return (
//     <>
//       <Dialog open={isOpen && !showProcessing && !showSecurityCheck && !showSuccess} onOpenChange={onClose}>
//         <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-auto">
//           <DialogHeader className="sticky top-0 bg-background z-10 pb-4">
//             <DialogTitle className="flex items-center gap-2">
//               <Globe className="h-5 w-5 text-primary" />
//               International Money Transfer
//             </DialogTitle>
//             <DialogDescription>
//               Send money globally via bank transfer or secure blockchain
//             </DialogDescription>
//           </DialogHeader>

//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//               <div className="space-y-2">
//                 <FormLabel>Transfer Method</FormLabel>
//                 <FormField
//                   control={form.control}
//                   name="transferType"
//                   render={({ field }) => (
//                     <FormItem>
//                       <Tabs
//                         value={field.value}
//                         onValueChange={field.onChange}
//                         className="w-full"
//                       >
//                         <TabsList className="grid grid-cols-2 w-full">
//                           <TabsTrigger value="bank" className="flex items-center gap-2">
//                             <BankIcon className="h-4 w-4" />
//                             <span>Bank Transfer</span>
//                           </TabsTrigger>
//                           <TabsTrigger value="crypto" className="flex items-center gap-2">
//                             <Coins className="h-4 w-4" />
//                             <span>Crypto Transfer</span>
//                           </TabsTrigger>
//                         </TabsList>

//                         <TabsContent value="bank" className="space-y-4 pt-4">
//                           <div className="grid grid-cols-2 gap-4">
//                             <FormField
//                               control={form.control}
//                               name="recipientName"
//                               render={({ field }) => (
//                                 <FormItem>
//                                   <FormLabel>Recipient Name</FormLabel>
//                                   <FormControl>
//                                     <Input placeholder="Full name" {...field} />
//                                   </FormControl>
//                                   <FormMessage />
//                                 </FormItem>
//                               )}
//                             />
//                             <FormField
//                               control={form.control}
//                               name="bankName"
//                               render={({ field }) => (
//                                 <FormItem>
//                                   <FormLabel>Bank Name</FormLabel>
//                                   <FormControl>
//                                     <Input placeholder="Recipient's bank" {...field} />
//                                   </FormControl>
//                                   <FormMessage />
//                                 </FormItem>
//                               )}
//                             />
//                           </div>

//                           <div className="grid grid-cols-2 gap-4">
//                             <FormField
//                               control={form.control}
//                               name="accountNumber"
//                               render={({ field }) => (
//                                 <FormItem>
//                                   <FormLabel>Account Number</FormLabel>
//                                   <FormControl>
//                                     <Input placeholder="Bank account number" {...field} />
//                                   </FormControl>
//                                   <FormMessage />
//                                 </FormItem>
//                               )}
//                             />
//                             <FormField
//                               control={form.control}
//                               name="swiftCode"
//                               render={({ field }) => (
//                                 <FormItem>
//                                   <FormLabel>SWIFT/BIC Code</FormLabel>
//                                   <FormControl>
//                                     <Input placeholder="International bank code" {...field} />
//                                   </FormControl>
//                                   <FormMessage />
//                                 </FormItem>
//                               )}
//                             />
//                           </div>

//                           <FormField
//                             control={form.control}
//                             name="recipientCountry"
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel>Recipient Country</FormLabel>
//                                 <Select
//                                   onValueChange={field.onChange}
//                                   defaultValue={field.value}
//                                 >
//                                   <FormControl>
//                                     <SelectTrigger>
//                                       <SelectValue placeholder="Select country" />
//                                     </SelectTrigger>
//                                   </FormControl>
//                                   <SelectContent>
//                                     <SelectItem value="USA">United States</SelectItem>
//                                     <SelectItem value="UK">United Kingdom</SelectItem>
//                                     <SelectItem value="CA">Canada</SelectItem>
//                                     <SelectItem value="AU">Australia</SelectItem>
//                                     <SelectItem value="EU">European Union</SelectItem>
//                                   </SelectContent>
//                                 </Select>
//                                 <FormMessage />
//                               </FormItem>
//                             )}
//                           />
//                         </TabsContent>

//                         <TabsContent value="crypto" className="space-y-4 pt-4">
//                           <FormField
//                             control={form.control}
//                             name="walletAddress"
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel>Recipient's Wallet Address</FormLabel>
//                                 <FormControl>
//                                   <Input placeholder="0x..." {...field} />
//                                 </FormControl>
//                                 <FormMessage />
//                                 <p className="text-xs text-muted-foreground mt-1">
//                                   Enter an Ethereum or Stellar wallet address.
//                                 </p>
//                               </FormItem>
//                             )}
//                           />
//                         </TabsContent>
//                       </Tabs>
//                     </FormItem>
//                   )}
//                 />
//               </div>

//               <div className="grid grid-cols-3 gap-4 pt-4">
//                 <FormField
//                   control={form.control}
//                   name="amount"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Amount</FormLabel>
//                       <FormControl>
//                         <Input
//                           type="number"
//                           placeholder="0.00"
//                           {...field}
//                           onChange={(e) => field.onChange(parseFloat(e.target.value))}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="sourceCurrency"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>From Currency</FormLabel>
//                       <Select
//                         onValueChange={field.onChange}
//                         defaultValue={field.value}
//                       >
//                         <FormControl>
//                           <SelectTrigger>
//                             <SelectValue placeholder="Select currency" />
//                           </SelectTrigger>
//                         </FormControl>
//                         <SelectContent>
//                           <SelectItem value="INR">INR - Indian Rupee</SelectItem>
//                           <SelectItem value="USD">USD - US Dollar</SelectItem>
//                           <SelectItem value="EUR">EUR - Euro</SelectItem>
//                           <SelectItem value="GBP">GBP - British Pound</SelectItem>
//                         </SelectContent>
//                       </Select>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="targetCurrency"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>To Currency</FormLabel>
//                       <Select
//                         onValueChange={field.onChange}
//                         defaultValue={field.value}
//                       >
//                         <FormControl>
//                           <SelectTrigger>
//                             <SelectValue placeholder="Select currency" />
//                           </SelectTrigger>
//                         </FormControl>
//                         <SelectContent>
//                           <SelectItem value="USD">USD - US Dollar</SelectItem>
//                           <SelectItem value="EUR">EUR - Euro</SelectItem>
//                           <SelectItem value="GBP">GBP - British Pound</SelectItem>
//                           <SelectItem value="INR">INR - Indian Rupee</SelectItem>
//                         </SelectContent>
//                       </Select>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>

//               {comparisonData && (
//                 <div className="mt-6 pt-4 border-t">
//                   <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
//                     <ArrowRightLeft className="h-4 w-4 text-primary" />
//                     Transfer Method Comparison
//                   </h3>
                  
//                   <div className="overflow-hidden rounded-lg border">
//                     <table className="w-full">
//                       <thead>
//                         <tr className="bg-muted/50">
//                           <th className="py-2 px-3 text-left text-xs font-medium text-muted-foreground">Feature</th>
//                           <th className="py-2 px-3 text-left">
//                             <div className="flex items-center gap-1.5">
//                               <BankIcon className="h-3.5 w-3.5 text-slate-600" />
//                               <span className="text-xs font-medium">Bank Transfer</span>
//                             </div>
//                           </th>
//                           <th className="py-2 px-3 text-left">
//                             <div className="flex items-center gap-1.5">
//                               <Coins className="h-3.5 w-3.5 text-blue-600" />
//                               <span className="text-xs font-medium">Crypto Transfer</span>
//                             </div>
//                           </th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y">
//                         <tr>
//                           <td className="py-2 px-3 text-xs font-medium text-muted-foreground">Speed</td>
//                           <td className="py-2 px-3">
//                             <div className="flex items-center gap-1.5">
//                               <Clock className="h-3.5 w-3.5 text-amber-600" />
//                               <span className="text-sm">{comparisonData.bank.processingTime}</span>
//                             </div>
//                           </td>
//                           <td className="py-2 px-3">
//                             <div className="flex items-center gap-1.5">
//                               <Zap className="h-3.5 w-3.5 text-green-600" />
//                               <span className="text-sm">{comparisonData.crypto.processingTime}</span>
//                             </div>
//                           </td>
//                         </tr>
                        
//                         <tr className="bg-muted/20">
//                           <td className="py-2 px-3 text-xs font-medium text-muted-foreground">Fee</td>
//                           <td className="py-2 px-3">
//                             <span className="text-sm text-red-600 font-medium">
//                               ₹{comparisonData.bank.fee.toLocaleString('en-IN')}
//                             </span>
//                             <span className="text-xs text-muted-foreground ml-1">
//                               (4% + ₹500 flat fee)
//                             </span>
//                           </td>
//                           <td className="py-2 px-3">
//                             <span className="text-sm text-blue-600 font-medium">
//                               ₹{comparisonData.crypto.fee.toLocaleString('en-IN')} <span className="text-xs">(0.6%)</span>
//                             </span>
//                           </td>
//                         </tr>
                        
//                         <tr>
//                           <td className="py-2 px-3 text-xs font-medium text-muted-foreground">Exchange Rate</td>
//                           <td className="py-2 px-3">
//                             <div className="flex flex-col">
//                               {isLoadingRates ? (
//                                 <div className="flex items-center gap-2">
//                                   <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
//                                   <span className="text-sm text-muted-foreground">Fetching rates...</span>
//                                 </div>
//                               ) : (
//                                 <>
//                                   <div className="flex items-center gap-1.5">
//                                     <span className="text-sm">₹1 = ${(1/comparisonData.bank.exchangeRate).toFixed(4)} USD</span>
//                                     {exchangeRateVariation > 0 ? (
//                                       <span className="text-xs text-green-600">+{(exchangeRateVariation * 100).toFixed(2)}%</span>
//                                     ) : exchangeRateVariation < 0 ? (
//                                       <span className="text-xs text-red-600">{(exchangeRateVariation * 100).toFixed(2)}%</span>
//                                     ) : null}
//                                   </div>
//                                   <span className="text-xs text-amber-600">(includes bank markup)</span>
//                                 </>
//                               )}
//                             </div>
//                           </td>
//                           <td className="py-2 px-3">
//                             <div className="flex flex-col">
//                               {isLoadingRates ? (
//                                 <div className="flex items-center gap-2">
//                                   <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
//                                   <span className="text-sm text-muted-foreground">Fetching market data...</span>
//                                 </div>
//                               ) : (
//                                 <>
//                                   <div className="flex items-center">
//                                     <span className="text-sm font-mono">₹1 = {(1/comparisonData.crypto.exchangeRate).toFixed(6)} ETH</span>
//                                     {exchangeRateVariation !== 0 && (
//                                       <span 
//                                         className={`ml-1.5 text-xs translate-z-0 ${
//                                           exchangeRateVariation > 0 ? 'text-green-600' : 'text-red-600'
//                                         }`}
//                                         style={{ willChange: 'contents' }}
//                                       >
//                                         {exchangeRateVariation > 0 ? '+' : ''}
//                                         {(exchangeRateVariation * 100).toFixed(3)}%
//                                       </span>
//                                     )}
//                                   </div>
//                                   <div className="flex items-center gap-1.5 mt-0.5">
//                                     <span className="text-xs text-green-600">Binance market rate</span>
//                                     <div className="w-1.5 h-1.5 rounded-full bg-green-500 opacity-75" 
//                                         style={{ animation: 'pulse 3s ease-in-out infinite', willChange: 'opacity' }}></div>
//                                   </div>
//                                 </>
//                               )}
//                             </div>
//                           </td>
//                         </tr>
                        
//                         <tr className="bg-muted/20">
//                           <td className="py-2 px-3 text-xs font-medium text-muted-foreground">Transparency</td>
//                           <td className="py-2 px-3">
//                             <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200">
//                               Limited visibility
//                             </Badge>
//                           </td>
//                           <td className="py-2 px-3">
//                             <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">
//                               Full on-chain verification
//                             </Badge>
//                           </td>
//                         </tr>
                        
//                         <tr>
//                           <td className="py-2 px-3 text-xs font-medium text-muted-foreground">Amount Received</td>
//                           <td className="py-2 px-3">
//                             <div className="flex flex-col">
//                               <span className="text-sm font-medium text-green-600">
//                                 ${comparisonData.bank.amountReceived.toFixed(2)} USD
//                               </span>
//                               <span className="text-xs text-muted-foreground">
//                                 (₹{watchAmount.toLocaleString('en-IN')} - ₹{comparisonData.bank.fee.toLocaleString('en-IN')} fees)
//                               </span>
//                             </div>
//                           </td>
//                           <td className="py-2 px-3">
//                             <div className="flex flex-col">
//                               <div className="flex justify-between text-sm font-medium">
//                                 <span>Recipient gets</span>
//                                 <div className="flex items-center">
//                                   <span className="text-green-600 font-mono select-none">
//                                     {comparisonData.crypto.amountReceived.toFixed(6)} ETH
//                                   </span>
//                                   {!isLoadingRates && exchangeRateVariation !== 0 && (
//                                     <span 
//                                       className={`ml-1.5 text-xs translate-z-0 ${
//                                         exchangeRateVariation > 0 ? 'text-green-600' : 'text-red-600'
//                                       }`}
//                                       style={{ transition: 'color 700ms ease-in-out', willChange: 'contents' }}
//                                     >
//                                       {exchangeRateVariation > 0 ? '↑' : '↓'}
//                                       {Math.abs(exchangeRateVariation * 100).toFixed(3)}%
//                                     </span>
//                                   )}
//                                 </div>
//                               </div>
//                               <span className="text-xs text-muted-foreground">
//                                 (₹{watchAmount.toLocaleString('en-IN')} - ₹{comparisonData.crypto.fee.toLocaleString('en-IN')} fees)
//                               </span>
//                             </div>
//                           </td>
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>
                  
//                   <div className="mt-4 grid grid-cols-2 gap-4">
//                     <Card className="border-muted-foreground/20 hover:border-muted-foreground/40 transition-colors will-change-auto">
//                       <CardContent className="pt-4">
//                         <div className="flex justify-between items-center mb-3">
//                           <div className="flex items-center gap-2">
//                             <BankIcon className="h-4 w-4 text-slate-600" />
//                             <h4 className="font-medium">Bank Transfer</h4>
//                           </div>
//                           <Progress value={33} className="w-24 h-2" />
//                         </div>
                        
//                         <div className="rounded-md bg-muted p-3">
//                           <div className="flex flex-col gap-1.5">
//                             <div className="flex justify-between text-sm">
//                               <span>You send</span>
//                               <span className="font-medium">₹{watchAmount.toLocaleString('en-IN')}</span>
//                             </div>
//                             <div className="flex justify-between text-sm">
//                               <span>Transfer fee</span>
//                               <span className="font-medium text-red-600">
//                                 - ₹{comparisonData.bank.fee.toLocaleString('en-IN')} <span className="text-xs">(4% + ₹500)</span>
//                               </span>
//                             </div>
//                             <div className="flex justify-between text-sm">
//                               <span>Exchange rate</span>
//                               {isLoadingRates ? (
//                                 <div className="flex items-center gap-1.5">
//                                   <Loader2 className="h-3 w-3 animate-spin" />
//                                   <span className="text-xs">Loading...</span>
//                                 </div>
//                               ) : (
//                                 <div className="flex items-center gap-1">
//                                   <span>₹1 = ${(1/comparisonData.bank.exchangeRate).toFixed(4)}</span>
//                                   {exchangeRateVariation !== 0 && (
//                                     <span className={`text-xs ${exchangeRateVariation > 0 ? 'text-green-600' : 'text-red-600'}`}>
//                                       {exchangeRateVariation > 0 ? '↑' : '↓'}
//                                     </span>
//                                   )}
//                                 </div>
//                               )}
//                             </div>
//                             <div className="h-px bg-border my-1"></div>
//                             <div className="flex justify-between text-sm font-medium">
//                               <span>Recipient gets</span>
//                               <span className="text-green-600">${comparisonData.bank.amountReceived.toFixed(2)} USD</span>
//                             </div>
//                             <div className="flex items-center gap-1.5 mt-1">
//                               <Clock className="h-3 w-3 text-amber-600" />
//                               <span className="text-xs text-muted-foreground">Arrives in {comparisonData.bank.processingTime}</span>
//                             </div>
//                           </div>
//                         </div>
//                       </CardContent>
//                     </Card>
                    
//                     <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 hover:from-blue-50 hover:to-indigo-50 transition-colors will-change-auto">
//                       <CardContent className="pt-4">
//                         <div className="flex justify-between items-center mb-3">
//                           <div className="flex items-center gap-2">
//                             <Coins className="h-4 w-4 text-blue-600" />
//                             <h4 className="font-medium">Crypto Transfer</h4>
//                           </div>
//                           <Progress value={95} className="w-24 h-2" />
//                         </div>
                        
//                         <div className="rounded-md bg-white/80 p-3 shadow-sm">
//                           <div className="flex flex-col gap-1.5">
//                             <div className="flex justify-between text-sm">
//                               <span>You send</span>
//                               <span className="font-medium">₹{watchAmount.toLocaleString('en-IN')}</span>
//                             </div>
//                             <div className="flex justify-between text-sm">
//                               <span>Network fee</span>
//                               <span className="font-medium text-blue-600">
//                                 - ₹{comparisonData.crypto.fee.toLocaleString('en-IN')} <span className="text-xs">(0.6%)</span>
//                               </span>
//                             </div>
//                             <div className="flex justify-between text-sm">
//                               <span>Gas (blockchain fee)</span>
//                               <span className="text-xs text-muted-foreground">Included in network fee</span>
//                             </div>
//                             <div className="flex justify-between text-sm">
//                               <span>Exchange rate</span>
//                               {isLoadingRates ? (
//                                 <div className="flex items-center gap-1.5">
//                                   <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
//                                   <span className="text-xs text-blue-600">Fetching market rates...</span>
//                                 </div>
//                               ) : (
//                                 <div className="flex items-center">
//                                   <span className="min-w-[110px] font-mono text-right select-none">
//                                     ₹1 = {(1/comparisonData.crypto.exchangeRate).toFixed(6)} ETH
//                                   </span>
//                                   {exchangeRateVariation !== 0 && (
//                                     <span 
//                                       className={`ml-1.5 text-xs translate-z-0 ${
//                                         exchangeRateVariation > 0 ? 'text-green-600' : 'text-red-600'
//                                       }`}
//                                       style={{ transition: 'color 700ms ease-in-out', willChange: 'contents' }}
//                                     >
//                                       {exchangeRateVariation > 0 ? '+' : ''}
//                                       {(exchangeRateVariation * 100).toFixed(3)}%
//                                     </span>
//                                   )}
//                                 </div>
//                               )}
//                             </div>
//                             <div className="h-px bg-border my-1"></div>
//                             <div className="flex justify-between text-sm font-medium">
//                               <span>Recipient gets</span>
//                               <div className="flex items-center">
//                                 <span className="text-green-600 font-mono select-none">
//                                   {comparisonData.crypto.amountReceived.toFixed(6)} ETH
//                                 </span>
//                                 {!isLoadingRates && exchangeRateVariation !== 0 && (
//                                   <span 
//                                     className={`ml-1.5 text-xs translate-z-0 ${
//                                       exchangeRateVariation > 0 ? 'text-green-600' : 'text-red-600'
//                                     }`}
//                                     style={{ transition: 'color 700ms ease-in-out', willChange: 'contents' }}
//                                   >
//                                     {exchangeRateVariation > 0 ? '↑' : '↓'}
//                                     {Math.abs(exchangeRateVariation * 100).toFixed(3)}%
//                                   </span>
//                                 )}
//                               </div>
//                             </div>
//                             <div className="flex items-center gap-1.5 mt-1">
//                               <Zap className="h-3 w-3 text-green-600" />
//                               <span className="text-xs text-green-600 font-medium">Arrives in {comparisonData.crypto.processingTime}</span>
//                             </div>
//                           </div>
//                         </div>
//                       </CardContent>
//                     </Card>
//                   </div>
                  
//                   <div className="text-xs text-muted-foreground mt-3 flex items-start gap-1.5">
//                     <Info className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
//                     <span>
//                       All fees shown in Indian Rupees (₹). Exchange rates updated in real-time. 
//                       Cryptocurrency transfers use a flat 0.6% fee vs. bank fees of 4% plus ₹500 fixed charge.
//                       Actual rates may vary at time of transaction.
//                       <span className="font-medium ml-1">Last updated: {new Date().toLocaleTimeString()}</span>
//                     </span>
//                   </div>
//                 </div>
//               )}

//               <div className="flex justify-end space-x-2 pt-4">
//                 <DialogClose asChild>
//                   <Button type="button" variant="outline">Cancel</Button>
//                 </DialogClose>
//                 <Button
//                   type="submit"
//                   className="bg-gradient-to-r from-indigo-600 to-blue-700"
//                 >
//                   {form.watch("transferType") === "bank" ? "Send via Bank" : "Send via Blockchain"}
//                 </Button>
//               </div>
//             </form>
//           </Form>
//         </DialogContent>
//       </Dialog>

//       <Dialog open={showSecurityCheck} onOpenChange={() => setShowSecurityCheck(false)}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle>Security Verification</DialogTitle>
//           </DialogHeader>

//           <SecurityVerification
//             onVerificationComplete={handleSecurityVerificationComplete}
//             action={formValues?.transferType === "bank" ? "Bank Transfer" : "Blockchain Transfer"}
//             amount={formValues?.amount}
//             recipient={formValues?.transferType === "bank" ? formValues?.recipientName : formValues?.walletAddress}
//             highSecurity={isHighAmount}
//           />
//         </DialogContent>
//       </Dialog>

//       <ProcessingModal
//         isOpen={showProcessing}
//         title={formValues?.transferType === "bank"
//           ? "Processing Bank Transfer"
//           : "Processing Blockchain Transfer"
//         }
//         message={formValues?.transferType === "bank"
//           ? "Initiating international bank transfer..."
//           : "Converting currency and preparing secure blockchain transaction..."
//         }
//         steps={formValues?.transferType === "bank" ? [
//           { id: "validate", label: "Validating bank details", status: "complete" },
//           { id: "security", label: "Running security checks", status: "processing" },
//           { id: "convert", label: "Converting currency", status: "pending" },
//           { id: "process", label: "Preparing bank transfer", status: "pending" },
//         ] : [
//           { id: "validate", label: "Validating wallet address", status: "complete" },
//           { id: "security", label: "Running blockchain security check", status: "processing" },
//           { id: "convert", label: "Converting to cryptocurrency", status: "pending" },
//           { id: "blockchain", label: "Creating blockchain transaction", status: "pending" },
//         ]}
//         onCancel={closeAll}
//       />

//       <SuccessModal
//         isOpen={showSuccess}
//         transaction={transactionDetails}
//         onClose={closeAll}
//       />
//     </>
//   );
// }

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
  Wallet
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import SuccessModal from "./SuccessModal";
import SecurityVerification from "./SecurityVerification";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

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
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative flex items-center justify-center mb-8 w-full max-w-md mx-auto">
        {/* Step 0-1: Currency Conversion Animation */}
        {step < 2 && (
          <div className="flex items-center justify-between w-full max-w-xs mx-auto">
            <motion.div 
              className="flex flex-col items-center"
              initial={{ opacity: 1 }}
              animate={{ opacity: showSourceAmount ? 1 : 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                <CircleDollarSign className="h-8 w-8 text-blue-600" />
              </div>
              <span className="text-sm font-medium">{fromCurrency}</span>
              <span className="text-lg font-bold">{fromAmount.toLocaleString()}</span>
            </motion.div>
            
            <motion.div
              className="flex flex-col items-center justify-center"
              animate={{ 
                rotate: [0, 180, 360],
                scale: [1, 1.2, 1],
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
              className="flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: showTargetAmount ? 1 : 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
                <Coins className="h-8 w-8 text-indigo-600" />
              </div>
              <span className="text-sm font-medium">{toCurrency}</span>
              <span className="text-lg font-bold">
                {toAmount.toFixed(6)}
              </span>
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
            <div className="w-full bg-indigo-50 rounded-xl p-4 flex items-center justify-center mb-4">
              <div className="relative w-full max-w-xs">
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div 
                    className="w-2 h-2 rounded-full bg-indigo-600"
                    animate={{ 
                      x: ['-50%', '150%'],
                      scale: [1, 1.5, 1],
                      opacity: [0.2, 1, 0.2]
                    }}
                    transition={{ 
                      duration: 1.2,
                      repeat: Infinity,
                      repeatType: "loop" 
                    }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Boxes className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="border-t-2 border-dashed border-indigo-300 flex-1 mx-2" />
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
              </div>
            </div>
            <div className="text-sm text-center text-muted-foreground">
              Securely transferring {toAmount.toFixed(6)} {toCurrency} via blockchain
            </div>
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
            <div className="flex items-center justify-between w-full max-w-xs mx-auto mb-4">
              <motion.div 
                className="flex flex-col items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center mb-1">
                  <Wallet className="h-7 w-7 text-indigo-600" />
                </div>
                <span className="text-xs font-medium">Recipient's Wallet</span>
              </motion.div>
              
              <motion.div 
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 0.8, repeat: 3 }}
              >
                <ChevronsRight className="h-5 w-5 text-muted-foreground" />
              </motion.div>
              
              <motion.div 
                className="flex flex-col items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-1">
                  <CircleDollarSign className="h-7 w-7 text-green-600" />
                </div>
                <span className="text-xs font-medium">Ready for Use</span>
              </motion.div>
            </div>
            <div className="text-sm text-center text-muted-foreground">
              Recipient can now convert {toCurrency} to their local currency or use directly
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
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-10 w-10 text-green-600" />
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Steps Progress */}
      <div className="w-full max-w-md mx-auto">
        <div className="flex space-x-2 mb-4">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-blue-600' : 'bg-gray-200'}`}
            />
          ))}
        </div>
        
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 border">
          <h3 className="font-medium text-sm flex items-center gap-2 mb-1">
            {steps[step].icon}
            {steps[step].title}
          </h3>
          <p className="text-sm text-muted-foreground">{steps[step].description}</p>
        </div>
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>

        {!showConversionFlow ? (
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              {updatedSteps.map((step) => (
                <div key={step.id} className="flex items-center gap-3">
                  {step.status === "complete" ? (
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    </div>
                  ) : step.status === "processing" ? (
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <Loader2 className="h-3.5 w-3.5 text-blue-600 animate-spin" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    </div>
                  )}
                  <span className="text-sm">{step.label}</span>
                  {step.status === "processing" && (
                    <Loader2 className="h-3 w-3 text-muted-foreground animate-spin ml-auto" />
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-xs text-muted-foreground">
              This process is secure and encrypted. Your transaction details are protected.
            </div>
          </div>
        ) : (
          <ConversionFlowAnimation
            fromAmount={10000}
            fromCurrency="INR"
            toAmount={0.00123}
            toCurrency="ETH"
            onComplete={onCancel}
          />
        )}

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={showConversionFlow}
          >
            {showConversionFlow ? "Processing..." : "Cancel"}
          </Button>
        </DialogFooter>
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
      setShowSuccess(true);
      
      toast({
        title: "Transfer Completed",
        description: data.transaction.type === "bank"
          ? `Your bank transfer of ${formatCurrency(data.transaction.amount, data.transaction.fromCurrency)} has been processed.`
          : `Successfully sent ${data.transaction.receivedAmount.toFixed(6)} ${data.transaction.toCurrency} to recipient.`,
        icon: <Shield className="h-4 w-4 text-green-500" />,
      });
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
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-auto">
          <DialogHeader className="sticky top-0 bg-background z-10 pb-4">
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              International Money Transfer
            </DialogTitle>
            <DialogDescription>
              Send money globally via bank transfer or secure blockchain
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <FormLabel>Transfer Method</FormLabel>
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
                        <TabsList className="grid grid-cols-2 w-full">
                          <TabsTrigger value="bank" className="flex items-center gap-2">
                            <BankIcon className="h-4 w-4" />
                            <span>Bank Transfer</span>
                          </TabsTrigger>
                          <TabsTrigger value="crypto" className="flex items-center gap-2">
                            <Coins className="h-4 w-4" />
                            <span>Crypto Transfer</span>
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="bank" className="space-y-4 pt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="recipientName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Recipient Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Full name" {...field} />
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
                                  <FormLabel>Bank Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Recipient's bank" {...field} />
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
                                  <FormLabel>Account Number</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Bank account number" {...field} />
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
                                  <FormLabel>SWIFT/BIC Code</FormLabel>
                                  <FormControl>
                                    <Input placeholder="International bank code" {...field} />
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
                                <FormLabel>Recipient Country</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
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

                        <TabsContent value="crypto" className="space-y-4 pt-4">
                          <FormField
                            control={form.control}
                            name="walletAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Recipient's Wallet Address</FormLabel>
                                <FormControl>
                                  <Input placeholder="0x..." {...field} />
                                </FormControl>
                                <FormMessage />
                                <p className="text-xs text-muted-foreground mt-1">
                                  Enter an Ethereum or Stellar wallet address
                                </p>
                              </FormItem>
                            )}
                          />
                        </TabsContent>
                      </Tabs>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
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
                      <FormLabel>From Currency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
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
                      <FormLabel>To Currency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
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
              </div>

              {comparisonData && (
                <div className="mt-6 pt-4 border-t">
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <ArrowRightLeft className="h-4 w-4 text-primary" />
                    Transfer Method Comparison
                    {isLoadingRates && (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                    )}
                  </h3>
                  
                  <div className="overflow-hidden rounded-lg border">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="py-2 px-3 text-left text-xs font-medium text-muted-foreground">Feature</th>
                          <th className="py-2 px-3 text-left">
                            <div className="flex items-center gap-1.5">
                              <BankIcon className="h-3.5 w-3.5 text-slate-600" />
                              <span className="text-xs font-medium">Bank Transfer</span>
                            </div>
                          </th>
                          <th className="py-2 px-3 text-left">
                            <div className="flex items-center gap-1.5">
                              <Coins className="h-3.5 w-3.5 text-blue-600" />
                              <span className="text-xs font-medium">Crypto Transfer</span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr>
                          <td className="py-2 px-3 text-xs font-medium text-muted-foreground">Speed</td>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-amber-600" />
                              <span className="text-sm">{comparisonData.bank.processingTime}</span>
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-1.5">
                              <Zap className="h-3.5 w-3.5 text-green-600" />
                              <span className="text-sm">{comparisonData.crypto.processingTime}</span>
                            </div>
                          </td>
                        </tr>
                        
                        <tr className="bg-muted/20">
                          <td className="py-2 px-3 text-xs font-medium text-muted-foreground">Fee</td>
                          <td className="py-2 px-3">
                            <span className="text-sm text-red-600 font-medium">
                              ₹{comparisonData.bank.fee.toLocaleString('en-IN')}
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">
                              (4% + ₹500 flat fee)
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <span className="text-sm text-blue-600 font-medium">
                              ₹{comparisonData.crypto.fee.toLocaleString('en-IN')} <span className="text-xs">(0.6%)</span>
                            </span>
                          </td>
                        </tr>
                        
                        <tr>
                          <td className="py-2 px-3 text-xs font-medium text-muted-foreground">Exchange Rate</td>
                          <td className="py-2 px-3">
                            <div className="flex flex-col">
                              <span className="text-sm">₹1 = ${(1/comparisonData.bank.exchangeRate).toFixed(4)} USD</span>
                              <span className="text-xs text-amber-600">(includes bank markup)</span>
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex flex-col">
                              <span className="text-sm">₹1 = {(1/comparisonData.crypto.exchangeRate).toFixed(6)} ETH</span>
                              <span className="text-xs text-green-600">Real-time market rate</span>
                            </div>
                          </td>
                        </tr>
                        
                        <tr className="bg-muted/20">
                          <td className="py-2 px-3 text-xs font-medium text-muted-foreground">Transparency</td>
                          <td className="py-2 px-3">
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200">
                              Limited visibility
                            </Badge>
                          </td>
                          <td className="py-2 px-3">
                            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">
                              Full on-chain verification
                            </Badge>
                          </td>
                        </tr>
                        
                        <tr>
                          <td className="py-2 px-3 text-xs font-medium text-muted-foreground">Amount Received</td>
                          <td className="py-2 px-3">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-green-600">
                                ${comparisonData.bank.amountReceived.toFixed(2)} USD
                              </span>
                              <span className="text-xs text-muted-foreground">
                                (₹{watchAmount.toLocaleString('en-IN')} - ₹{comparisonData.bank.fee.toLocaleString('en-IN')} fees)
                              </span>
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-green-600">
                                {comparisonData.crypto.amountReceived.toFixed(6)} ETH
                              </span>
                              <span className="text-xs text-muted-foreground">
                                (₹{watchAmount.toLocaleString('en-IN')} - ₹{comparisonData.crypto.fee.toLocaleString('en-IN')} fees)
                              </span>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <Card className="border-muted-foreground/20 hover:border-muted-foreground/40 transition-colors">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-2">
                            <BankIcon className="h-4 w-4 text-slate-600" />
                            <h4 className="font-medium">Bank Transfer</h4>
                          </div>
                          <Progress value={33} className="w-24 h-2" />
                        </div>
                        
                        <div className="rounded-md bg-muted p-3">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between text-sm">
                              <span>You send</span>
                              <span className="font-medium">₹{watchAmount.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Transfer fee</span>
                              <span className="font-medium text-red-600">
                                - ₹{comparisonData.bank.fee.toLocaleString('en-IN')} <span className="text-xs">(4% + ₹500)</span>
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Exchange rate</span>
                              <span>₹1 = ${(1/comparisonData.bank.exchangeRate).toFixed(4)}</span>
                            </div>
                            <div className="h-px bg-border my-1"></div>
                            <div className="flex justify-between text-sm font-medium">
                              <span>Recipient gets</span>
                              <span className="text-green-600">${comparisonData.bank.amountReceived.toFixed(2)} USD</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <Clock className="h-3 w-3 text-amber-600" />
                              <span className="text-xs text-muted-foreground">Arrives in {comparisonData.bank.processingTime}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 hover:from-blue-50 hover:to-indigo-50 transition-colors">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-2">
                            <Coins className="h-4 w-4 text-blue-600" />
                            <h4 className="font-medium">Crypto Transfer</h4>
                          </div>
                          <Progress value={95} className="w-24 h-2" />
                        </div>
                        
                        <div className="rounded-md bg-white/80 p-3 shadow-sm">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between text-sm">
                              <span>You send</span>
                              <span className="font-medium">₹{watchAmount.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Network fee</span>
                              <span className="font-medium text-blue-600">
                                - ₹{comparisonData.crypto.fee.toLocaleString('en-IN')} <span className="text-xs">(0.6%)</span>
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Gas (blockchain fee)</span>
                              <span className="text-xs text-muted-foreground">Included in network fee</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Exchange rate</span>
                              <span className="font-mono">₹1 = {(1/comparisonData.crypto.exchangeRate).toFixed(6)} ETH</span>
                            </div>
                            <div className="h-px bg-border my-1"></div>
                            <div className="flex justify-between text-sm font-medium">
                              <span>Recipient gets</span>
                              <span className="text-green-600">{comparisonData.crypto.amountReceived.toFixed(6)} ETH</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <Zap className="h-3 w-3 text-green-600" />
                              <span className="text-xs text-green-600 font-medium">Arrives in {comparisonData.crypto.processingTime}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-3 flex items-start gap-1.5">
                    <Info className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <span>
                      All fees shown in Indian Rupees (₹). Exchange rates are fixed for demo purposes.
                      Cryptocurrency transfers use a flat 0.6% fee vs. bank fees of 4% plus ₹500 fixed charge.
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-indigo-600 to-blue-700"
                  disabled={!watchAmount || watchAmount <= 0}
                >
                  {form.watch("transferType") === "bank" ? "Send via Bank" : "Send via Blockchain"}
                </Button>
              </div>
            </form>
          </Form>
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
          { id: "convert", label: "Converting currency", status: "pending" },
          { id: "process", label: "Preparing bank transfer", status: "pending" },
        ] : [
          { id: "validate", label: "Validating wallet address", status: "complete" },
          { id: "security", label: "Running blockchain security check", status: "processing" },
          { id: "convert", label: "Converting to cryptocurrency", status: "pending" },
          { id: "blockchain", label: "Creating blockchain transaction", status: "pending" },
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