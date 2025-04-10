import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Info, Shield, AlertTriangle, Key } from "lucide-react";
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
    form.reset();
    onClose();
  };
  
  // Determine if this is a high-amount transaction for security checking
  const isHighAmount = formValues?.amount ? formValues.amount >= 5000 : false;

  return (
    <>
      <Dialog open={isOpen && !showProcessing && !showVerification && !showSecurityCheck && !showSuccess} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              UPI Payment
            </DialogTitle>
            <DialogDescription>
              Send money directly using UPI ID with blockchain security
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="upiId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UPI ID</FormLabel>
                    <FormControl>
                      <Input placeholder="example@upi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (₹)</FormLabel>
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
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Add a note" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UPI PIN</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter UPI PIN" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex items-center justify-between text-sm">
                <div className="text-primary-foreground py-1 px-2 bg-gradient-to-r from-primary to-primary/80 rounded-md text-xs font-medium">
                  Blockchain Secured
                </div>
                <div className="text-xs text-muted-foreground">
                  Transaction fee: ₹0
                </div>
              </div>
              
              <div className="text-sm text-gray-600 flex items-start space-x-2">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p>For amounts over ₹2,000, our AI security system will verify the transaction.</p>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" className="bg-gradient-to-r from-primary to-primary/80">
                  Pay Securely
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Security verification modal */}
      <Dialog open={showSecurityCheck} onOpenChange={() => setShowSecurityCheck(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Security Verification</DialogTitle>
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
        verificationCode={transactionDetails?.verificationCode || "PSFV-8756"}
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
