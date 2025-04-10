import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
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
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [showProcessing, setShowProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);

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

  // Update conversion when amount or currency changes
  useEffect(() => {
    const updateConversion = async () => {
      if (watchAmount && watchAmount > 0) {
        try {
          const result = await convertCurrency(watchAmount, watchCurrency);
          setConversionResult(result);
        } catch (error) {
          console.error("Error converting currency:", error);
        }
      } else {
        setConversionResult(null);
      }
    };

    updateConversion();
  }, [watchAmount, watchCurrency]);

  const internationalPaymentMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      return await apiRequest("POST", "/api/payments/international", values);
    },
    onSuccess: async (response) => {
      const data = await response.json();
      setTransactionDetails(data.transaction);
      setShowProcessing(false);
      setShowSuccess(true);
    },
    onError: (error) => {
      setShowProcessing(false);
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setShowProcessing(true);
    internationalPaymentMutation.mutate(values);
  };

  const closeAll = () => {
    setShowProcessing(false);
    setShowSuccess(false);
    form.reset();
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen && !showProcessing && !showSuccess} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>International Payment</DialogTitle>
            <DialogDescription>Send money abroad using Ethereum blockchain</DialogDescription>
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
                <div className="bg-gray-50 p-4 rounded-md space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Conversion Rate</span>
                    <span className="text-sm font-medium">
                      1 ETH = {formatCurrency(conversionResult.rate, conversionResult.fromCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Recipient Gets</span>
                    <span className="text-sm font-medium">
                      {conversionResult.toAmount.toFixed(6)} ETH
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Fee</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(conversionResult.fee, conversionResult.fromCurrency)}
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Total Amount</span>
                      <span className="text-sm font-semibold">
                        {formatCurrency(
                          conversionResult.fromAmount + conversionResult.fee, 
                          conversionResult.fromCurrency
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="text-sm text-gray-600 flex items-start space-x-2">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p>Transactions are secured via Ethereum blockchain technology.</p>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Convert & Send</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ProcessingModal 
        isOpen={showProcessing} 
        title="Processing International Payment"
        message="Converting currency and preparing blockchain transfer..."
        steps={[
          { id: "validate", label: "Validating wallet address", status: "complete" },
          { id: "fraud", label: "Running fraud detection check", status: "processing" },
          { id: "convert", label: "Converting currency", status: "pending" },
          { id: "blockchain", label: "Processing on Ethereum blockchain", status: "pending" },
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
