import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Info, Shield, AlertTriangle, Globe, ArrowRightLeft, Boxes } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { internationalPaymentSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { convertCurrency, estimateGas } from "@/lib/ethereum";
import ProcessingModal from "./ProcessingModal";
import SuccessModal from "./SuccessModal";
import SecurityVerification from "./SecurityVerification";

interface InternationalPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formSchema = internationalPaymentSchema.extend({
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

export default function InternationalPaymentModal({ isOpen, onClose }: InternationalPaymentModalProps) {
  const { user, analyzeSecurity } = useAuth();
  const { toast } = useToast();
  
  const [showProcessing, setShowProcessing] = useState(false);
  const [showSecurityCheck, setShowSecurityCheck] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [formValues, setFormValues] = useState<z.infer<typeof formSchema> | null>(null);
  const [gasEstimate, setGasEstimate] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      walletAddress: "",
      amount: 0,
      currency: "INR",
      senderId: user?.id,
    },
  });

  const watchAmount = form.watch("amount");
  const watchCurrency = form.watch("currency");
  const watchWalletAddress = form.watch("walletAddress");

  // Update conversion when amount or currency changes
  useEffect(() => {
    const updateConversion = async () => {
      if (watchAmount && watchAmount > 0) {
        try {
          const result = await convertCurrency(watchAmount, watchCurrency);
          setConversionResult(result);
          
          // Also get gas estimate if wallet address is valid
          if (watchWalletAddress && watchWalletAddress.startsWith('0x') && watchWalletAddress.length === 42) {
            try {
              const gasEstimateValue = await estimateGas(watchWalletAddress, result.toAmount.toString());
              setGasEstimate(gasEstimateValue);
            } catch (error) {
              console.error("Error estimating gas:", error);
              setGasEstimate(null);
            }
          }
        } catch (error) {
          console.error("Error converting currency:", error);
          setConversionResult(null);
        }
      } else {
        setConversionResult(null);
      }
    };

    updateConversion();
  }, [watchAmount, watchCurrency, watchWalletAddress]);

  const internationalPaymentMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      return await apiRequest("POST", "/api/payments/international", values);
    },
    onSuccess: async (response) => {
      const data = await response.json();
      setTransactionDetails(data.transaction);
      setShowProcessing(false);
      setShowSuccess(true);
      
      toast({
        title: "Blockchain Transfer Complete",
        description: `Your ${watchCurrency} has been converted to ETH and sent. Transaction confirmed on Ethereum blockchain.`,
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
    // First show security verification
    setShowSecurityCheck(true);
  };
  
  const handleSecurityVerificationComplete = (success: boolean) => {
    setShowSecurityCheck(false);
    
    if (success && formValues) {
      setShowProcessing(true);
      // Add slight delay to make the process feel more secure
      setTimeout(() => {
        internationalPaymentMutation.mutate(formValues);
      }, 800);
    } else if (!success) {
      toast({
        variant: "destructive",
        title: "Transaction Blocked",
        description: "This international transfer was automatically blocked due to suspicious activity. Your funds are safe.",
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
  
  // Determine if high-amount transfer for increased security scrutiny
  const isHighAmount = formValues?.amount ? formValues.amount >= 15000 : false;

  return (
    <>
      <Dialog open={isOpen && !showProcessing && !showSecurityCheck && !showSuccess} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              International Transfer
            </DialogTitle>
            <DialogDescription>
              Send money globally via secure Ethereum blockchain
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="walletAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient's Ethereum Wallet</FormLabel>
                    <FormControl>
                      <Input placeholder="0x..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
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
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
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
              </div>
              
              {conversionResult && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-md space-y-2 border border-blue-100">
                  <div className="flex items-center justify-center pb-2">
                    <div className="flex items-center gap-2 text-blue-700 font-medium">
                      <ArrowRightLeft className="h-4 w-4 text-blue-600" />
                      <span>Currency Conversion via Blockchain</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700">Conversion Rate</span>
                    <span className="text-sm font-medium text-blue-800">
                      1 ETH = {formatCurrency(conversionResult.rate, conversionResult.fromCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700">Recipient Gets</span>
                    <div className="flex items-center gap-1">
                      <Boxes className="h-3 w-3 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        {conversionResult.toAmount.toFixed(6)} ETH
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700">Network Fee</span>
                    <span className="text-sm font-medium text-blue-800">
                      {formatCurrency(conversionResult.fee, conversionResult.fromCurrency)}
                    </span>
                  </div>
                  {gasEstimate && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-700">Est. Gas</span>
                      <span className="text-sm font-medium text-blue-800">
                        {gasEstimate} Gwei
                      </span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-blue-800">Total Amount</span>
                      <span className="text-sm font-semibold text-blue-900">
                        {formatCurrency(
                          conversionResult.fromAmount + conversionResult.fee, 
                          conversionResult.fromCurrency
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-green-50 p-3 rounded-md text-sm text-green-700 flex items-start space-x-2 border border-green-100">
                <Shield className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                <p>International transfers use Ethereum blockchain for enhanced security, speed, and lower fees than traditional banks.</p>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-indigo-600 to-blue-700"
                >
                  Convert & Send Securely
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
            action="International Transfer"
            amount={formValues?.amount}
            recipient={formValues?.walletAddress}
            highSecurity={isHighAmount}
          />
        </DialogContent>
      </Dialog>

      <ProcessingModal 
        isOpen={showProcessing} 
        title="Processing Blockchain Transfer"
        message="Converting currency and preparing secure Ethereum transaction..."
        steps={[
          { id: "validate", label: "Validating wallet address", status: "complete" },
          { id: "security", label: "Running blockchain security check", status: "processing" },
          { id: "convert", label: "Converting to Ethereum", status: "pending" },
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
