import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { upiPaymentSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import ProcessingModal from "./ProcessingModal";
import UpiVerificationModal from "./UpiVerificationModal";
import SuccessModal from "./SuccessModal";

interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formSchema = upiPaymentSchema.extend({
  senderId: z.number(),
});

export default function UpiPaymentModal({ isOpen, onClose }: UpiPaymentModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [showProcessing, setShowProcessing] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState<any>(null);

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
    upiPaymentMutation.mutate(values);
  };

  const closeAll = () => {
    setShowProcessing(false);
    setShowVerification(false);
    setShowSuccess(false);
    form.reset();
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen && !showProcessing && !showVerification && !showSuccess} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>UPI Payment</DialogTitle>
            <DialogDescription>Send money directly using UPI ID</DialogDescription>
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
              
              <div className="text-sm text-gray-600 flex items-start space-x-2">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p>For amounts over ₹2,000, receiver will need to approve the transaction.</p>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Pay Now</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ProcessingModal 
        isOpen={showProcessing} 
        title="Processing UPI Payment"
        message="Securely processing your UPI transaction..."
        steps={[
          { id: "validate", label: "Validating payment details", status: "complete" },
          { id: "fraud", label: "Running fraud detection check", status: "processing" },
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
