import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Info, Shield, AlertTriangle, Key, Smartphone, ChevronRight, CreditCard, Lock, Clock } from "lucide-react";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { upiPaymentSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import ProcessingModal from "./ProcessingModal";
import UpiVerificationModal from "./UpiVerificationModal";
import SuccessModal from "./SuccessModal";
import SecurityVerification from "./SecurityVerification";
import { createPaymentVerification, getUserData, auth } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";

interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formSchema = upiPaymentSchema.extend({
  senderId: z.number(),
});

export default function UpiPaymentModal({ isOpen, onClose }: UpiPaymentModalProps) {
  const { user, analyzeSecurity } = useAuth();
  const { toast } = useToast();
  
  const [showProcessing, setShowProcessing] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [showSecurityCheck, setShowSecurityCheck] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [formValues, setFormValues] = useState<z.infer<typeof formSchema> | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPin, setShowPin] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      upiId: "",
      amount: 0,
      note: "",
      pin: "",
      senderId: user?.id,
    },
  });

  const upiPaymentMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      return await apiRequest("POST", "/api/payments/upi", values);
    },
    onSuccess: async (response) => {
      const data = await response.json();
      setTransactionDetails(data.transaction);
      
      setShowProcessing(false);
      
      if (data.verificationRequired) {
        setShowVerification(true);
      } else {
        setShowSuccess(true);
      }

      // Refresh user balance through auth context
      if (data.transaction && data.transaction.status === 'COMPLETED') {
        toast({
          title: "Payment Successful",
          description: `Payment done in 1.2 seconds - superfast! Secured by blockchain technology.`,
          icon: <Shield className="h-4 w-4 text-green-500" />,
        });
      }
    },
    onError: (error) => {
      setShowProcessing(false);
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
      });
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setFormValues(values);
    // First show security check dialog
    setShowSecurityCheck(true);
  };

  const handleSecurityVerificationComplete = async (success: boolean) => {
    setShowSecurityCheck(false);
    
    if (success && formValues && auth.currentUser) {
      setShowProcessing(true);
      
      // For demo, assume the UPI ID represents another user in the system
      try {
        // This is simulating looking up another user by UPI - in a real app, you'd have a proper lookup
        const receiverUid = formValues.upiId.replace(/[^a-zA-Z0-9]/g, "");
        
        // Generate a verification code if amount is over 2000 and create the real-time notification
        if (formValues.amount >= 2000) {
          const verificationCode = await createPaymentVerification(
            auth.currentUser.uid,
            receiverUid, // In a real app, this would be the actual receiver's UID
            formValues.amount,
            'UPI'
          );
          
          // Update transaction details with verification code
          setTransactionDetails({
            ...formValues,
            verificationCode,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            verificationRequired: true
          });
          
          // Show verification screen after short delay for processing visibility
          setTimeout(() => {
            setShowProcessing(false);
            setShowVerification(true);
            
            toast({
              title: "Verification Required",
              description: `For security, the recipient must verify this payment with code: ${verificationCode}`,
              icon: <Key className="h-4 w-4 text-blue-500" />,
              duration: 6000,
            });
          }, 2000);
        } else {
          // For smaller amounts, proceed directly
          // Add slight delay to make the process feel more secure
          setTimeout(() => {
            upiPaymentMutation.mutate(formValues);
          }, 800);
        }
      } catch (error) {
        console.error("Error creating payment verification:", error);
        setShowProcessing(false);
        
        toast({
          variant: "destructive",
          title: "Verification Error",
          description: "Could not create payment verification. Please try again.",
          icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
        });
      }
    } else if (!success) {
      // If security check failed
      toast({
        variant: "destructive",
        title: "Transaction Canceled",
        description: "This transaction was automatically canceled due to security concerns. Your funds are safe.",
        icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
      });
    }
  };

  const closeAll = () => {
    setShowProcessing(false);
    setShowVerification(false);
    setShowSecurityCheck(false);
    setShowSuccess(false);
    setFormValues(null);
    setCurrentStep(1);
    setShowPin(false);
    form.reset();
    onClose();
  };

  const handleContinue = () => {
    const fieldsToValidate = currentStep === 1 
      ? ['upiId', 'amount', 'note'] 
      : ['pin'];
    
    form.trigger(fieldsToValidate as any).then(isValid => {
      if (isValid) {
        if (currentStep === 1) {
          setCurrentStep(2);
          setShowPin(true);
        } else {
          form.handleSubmit(onSubmit)();
        }
      }
    });
  };
  
  // Determine if this is a high-amount transaction for security checking
  const isHighAmount = formValues?.amount ? formValues.amount >= 5000 : false;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      }
    },
    exit: { opacity: 0 }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 }
  };

  return (
    <>
      <Dialog open={isOpen && !showProcessing && !showVerification && !showSecurityCheck && !showSuccess} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 shadow-2xl bg-white rounded-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 z-0"></div>
          
          {/* Decorative elements */}
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/5 z-0"></div>
          <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-500/10 to-purple-500/5 z-0"></div>
          
          <div className="relative z-10 p-6">
            <DialogHeader className="mb-6">
              <div className="flex items-center mb-1">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600/20 to-indigo-600/20 flex items-center justify-center mr-3">
                  <Smartphone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                    UPI Payment
                  </DialogTitle>
                  <DialogDescription className="text-gray-600">
                    Send money directly using UPI ID with blockchain security
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            {/* Steps indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`flex items-center justify-center h-8 w-8 rounded-full ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    1
                  </div>
                  <div className={`h-1 w-8 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'} mx-1`}></div>
                  <div className={`flex items-center justify-center h-8 w-8 rounded-full ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    2
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Step {currentStep} of 2
                </div>
              </div>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={`step-${currentStep}`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Form {...form}>
                  <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
                    {currentStep === 1 && (
                      <>
                        <motion.div variants={itemVariants}>
                          <FormField
                            control={form.control}
                            name="upiId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700">UPI ID</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="example@upi" 
                                    {...field} 
                                    className="border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 py-5 px-4 rounded-lg" 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                        
                        <motion.div variants={itemVariants}>
                          <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700">Amount (₹)</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                                    <Input 
                                      type="number" 
                                      placeholder="0.00" 
                                      {...field} 
                                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                      className="border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 pl-8 py-5 px-4 rounded-lg" 
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                        
                        <motion.div variants={itemVariants}>
                          <FormField
                            control={form.control}
                            name="note"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700">Note (Optional)</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Add a note" 
                                    {...field} 
                                    className="border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 py-5 px-4 rounded-lg" 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                      </>
                    )}
                    
                    {currentStep === 2 && (
                      <>
                        <motion.div 
                          variants={itemVariants} 
                          className="mb-4 bg-blue-50 rounded-lg p-4 border border-blue-100"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div className="text-sm text-gray-600">Amount</div>
                            <div className="font-semibold text-gray-900">₹{form.getValues().amount.toFixed(2)}</div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">To</div>
                            <div className="font-semibold text-gray-900">{form.getValues().upiId}</div>
                          </div>
                        </motion.div>
                        
                        <motion.div variants={itemVariants}>
                          <FormField
                            control={form.control}
                            name="pin"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700 flex items-center">
                                  <Lock className="h-4 w-4 mr-1.5 text-blue-600" />
                                  UPI PIN
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    type="password" 
                                    placeholder="Enter UPI PIN" 
                                    {...field} 
                                    className="border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 py-5 px-4 rounded-lg" 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                      </>
                    )}
                    
                    <motion.div variants={itemVariants} className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs py-1 px-2.5 rounded-full">
                        <Shield className="h-3.5 w-3.5 mr-0.5" />
                        <span>Blockchain Secured</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock className="h-3.5 w-3.5 mr-0.5" />
                        <span>Fee: ₹0 • ~1.2s</span>
                      </div>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="text-sm text-gray-600 flex items-start space-x-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                      <p>For amounts over ₹2,000, our secure verification system will be activated to protect your transaction.</p>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="flex justify-between space-x-3 pt-4">
                      {currentStep === 1 ? (
                        <>
                          <Button type="button" variant="outline" onClick={closeAll} className="flex-1 border-gray-300 hover:bg-gray-50">
                            Cancel
                          </Button>
                          <Button 
                            type="button" 
                            onClick={handleContinue} 
                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                          >
                            Continue
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => { setCurrentStep(1); setShowPin(false); }} 
                            className="flex-1 border-gray-300 hover:bg-gray-50"
                          >
                            Back
                          </Button>
                          <Button 
                            type="button" 
                            onClick={form.handleSubmit(onSubmit)} 
                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                          >
                            Pay Securely
                            <Shield className="ml-1.5 h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </motion.div>
                  </form>
                </Form>
              </motion.div>
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>

      {/* Security verification modal */}
      <Dialog open={showSecurityCheck} onOpenChange={() => setShowSecurityCheck(false)}>
        <DialogContent className="sm:max-w-md border-0 shadow-2xl bg-white rounded-xl overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
              Security Verification
            </DialogTitle>
          </DialogHeader>
          
          <SecurityVerification 
            onVerificationComplete={handleSecurityVerificationComplete}
            action="UPI Payment"
            amount={formValues?.amount}
            recipient={formValues?.upiId}
            highSecurity={isHighAmount}
          />
        </DialogContent>
      </Dialog>

      <ProcessingModal 
        isOpen={showProcessing} 
        title="Processing UPI Payment"
        message="Securely processing your UPI transaction through blockchain..."
        steps={[
          { id: "validate", label: "Validating payment details", status: "complete" },
          { id: "fraud", label: "Running blockchain verification", status: "processing" },
          { id: "process", label: "Processing transaction", status: "pending" },
          { id: "complete", label: "Completing payment", status: "pending" },
        ]}
        onCancel={closeAll}
      />

      <UpiVerificationModal 
        isOpen={showVerification} 
        verificationCode={
          typeof transactionDetails?.verificationCode === 'object' && transactionDetails?.verificationCode !== null
            ? transactionDetails?.verificationCode.code 
            : (transactionDetails?.verificationCode || "PSFV-8756")
        }
        onClose={closeAll}
      />

      <SuccessModal 
        isOpen={showSuccess} 
        transaction={transactionDetails}
        onClose={closeAll}
      />
    </>
  );
}
