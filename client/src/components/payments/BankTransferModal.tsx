import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Info, Shield, AlertTriangle, Building, LockKeyhole } from "lucide-react";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { bankTransferSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import ProcessingModal from "./ProcessingModal";
import SuccessModal from "./SuccessModal";
import SecurityVerification from "./SecurityVerification";

interface BankTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formSchema = bankTransferSchema.extend({
  senderId: z.number(),
});

export default function BankTransferModal({ isOpen, onClose }: BankTransferModalProps) {
  const { user, analyzeSecurity } = useAuth();
  const { toast } = useToast();
  
  const [showProcessing, setShowProcessing] = useState(false);
  const [showSecurityCheck, setShowSecurityCheck] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [formValues, setFormValues] = useState<z.infer<typeof formSchema> | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      beneficiaryName: "",
      accountNumber: "",
      ifscCode: "",
      amount: 0,
      note: "",
      senderId: user?.id,
    },
  });

  const bankTransferMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      return await apiRequest("POST", "/api/payments/bank", values);
    },
    onSuccess: async (response) => {
      const data = await response.json();
      setTransactionDetails(data.transaction);
      setShowProcessing(false);
      setShowSuccess(true);
      
      toast({
        title: "Transfer Initiated",
        description: `Funds will be securely held in blockchain escrow until verification is complete.`,
        icon: <Shield className="h-4 w-4 text-green-500" />,
      });
    },
    onError: (error) => {
      setShowProcessing(false);
      toast({
        variant: "destructive",
        title: "Transfer Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
      });
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setFormValues(values);
    // Show security verification before processing
    setShowSecurityCheck(true);
  };
  
  const handleSecurityVerificationComplete = (success: boolean) => {
    setShowSecurityCheck(false);
    
    if (success && formValues) {
      setShowProcessing(true);
      // Add slight delay to simulate backend security checks
      setTimeout(() => {
        bankTransferMutation.mutate(formValues);
      }, 800);
    } else if (!success) {
      toast({
        variant: "destructive",
        title: "Transaction Blocked",
        description: "This transfer was automatically blocked due to security concerns. Your funds are safe.",
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
  
  // Determine if high-amount transfer
  const isHighAmount = formValues?.amount ? formValues.amount >= 10000 : false;

  return (
    <>
      <Dialog open={isOpen && !showProcessing && !showSecurityCheck && !showSuccess} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              Bank Transfer
            </DialogTitle>
            <DialogDescription>
              Transfer funds to a bank account with blockchain security
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="beneficiaryName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beneficiary Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter account number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="ifscCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IFSC Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter IFSC code" {...field} />
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
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-primary-foreground py-1 px-2 bg-gradient-to-r from-blue-600 to-blue-800 rounded-md text-xs font-medium">
                  <LockKeyhole className="h-3 w-3" />
                  <span>Blockchain Secured Escrow</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Transaction fee: ₹0
                </div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700 flex items-start space-x-2 border border-blue-100">
                <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <p>Funds will be securely held in blockchain escrow until verification is complete. This provides maximum protection against unauthorized transfers.</p>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-blue-600 to-blue-700"
                >
                  Transfer Securely
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
            action="Bank Transfer"
            amount={formValues?.amount}
            recipient={formValues?.beneficiaryName}
            highSecurity={isHighAmount}
          />
        </DialogContent>
      </Dialog>

      <ProcessingModal 
        isOpen={showProcessing} 
        title="Processing Bank Transfer"
        message="Initiating secure blockchain transfer..."
        steps={[
          { id: "validate", label: "Validating account details", status: "complete" },
          { id: "blockchain", label: "Creating blockchain escrow", status: "processing" },
          { id: "process", label: "Processing transaction", status: "pending" },
          { id: "complete", label: "Placing funds on secure hold", status: "pending" },
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
