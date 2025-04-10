import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
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
  Zap 
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { convertCurrency, estimateGas } from "@/lib/ethereum";
import ProcessingModal from "./ProcessingModal";
import SuccessModal from "./SuccessModal";
import SecurityVerification from "./SecurityVerification";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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
  const { user, analyzeSecurity } = useAuth();
  const { toast } = useToast();

  const [showProcessing, setShowProcessing] = useState(false);
  const [showSecurityCheck, setShowSecurityCheck] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [formValues, setFormValues] = useState<z.infer<typeof formSchema> | null>(null);
  const [gasEstimate, setGasEstimate] = useState<string | null>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);

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
      senderId: user?.id,
    },
  });

  const watchAmount = form.watch("amount");
  const watchSourceCurrency = form.watch("sourceCurrency");
  const watchTargetCurrency = form.watch("targetCurrency");
  const watchTransferType = form.watch("transferType");
  const watchWalletAddress = form.watch("walletAddress");

  useEffect(() => {
    const updateComparisonData = async () => {
      if (watchAmount && watchAmount > 0) {
        try {
          // Bank transfer fee: constant 4%
          const bankFeePercentage = 0.04; // Fixed at 4%
          
          // Add flat fee component for bank transfers
          const bankFlatFee = 500; // Fixed processing fee in INR
          const bankExchangeRate = 82.5; // Example INR to USD rate
          const bankFee = (watchAmount * bankFeePercentage) + bankFlatFee;
          const bankAmountReceived = (watchAmount - bankFee) / bankExchangeRate;

          // Crypto transfer fee: constant 0.6%
          const cryptoFeePercentage = 0.006; // Fixed at 0.6%
          
          // Calculate crypto fee based on fixed percentage
          const cryptoFee = watchAmount * cryptoFeePercentage;
          
          // You could also fetch real crypto conversion rates here
          const mockCryptoRate = 0.000012; // Example rate INR to ETH
          const cryptoExchangeRate = 1 / mockCryptoRate;
          const cryptoAmountReceived = (watchAmount - cryptoFee) * mockCryptoRate;

          const cryptoResult: ConversionResult = {
            fromAmount: watchAmount,
            fromCurrency: watchSourceCurrency,
            toAmount: cryptoAmountReceived,
            toCurrency: 'ETH',
            rate: cryptoExchangeRate,
            fee: cryptoFee
          };

          setComparisonData({
            bank: {
              fee: bankFee,
              processingTime: "2-5 business days",
              exchangeRate: bankExchangeRate,
              amountReceived: bankAmountReceived,
            },
            crypto: {
              fee: cryptoFee,
              processingTime: "~15 seconds",
              exchangeRate: cryptoExchangeRate,
              amountReceived: cryptoAmountReceived,
              gasEstimate: gasEstimate || "12-20 Gwei"
            }
          });

          setConversionResult(cryptoResult);
        } catch (error) {
          console.error("Error generating comparison data:", error);
          setComparisonData(null);
        }
      } else {
        setComparisonData(null);
        setConversionResult(null);
      }
    };

    updateComparisonData();
  }, [watchAmount, watchSourceCurrency, watchTargetCurrency, gasEstimate]);

  useEffect(() => {
    const updateGasEstimate = async () => {
      if (watchWalletAddress &&
          watchAmount > 0 &&
          watchTransferType === "crypto" &&
          watchWalletAddress.startsWith('0x') &&
          watchWalletAddress.length === 42) {
        try {
          const estimatedAmount = conversionResult?.toAmount || 0.01;
          const gasEstimateValue = await estimateGas(watchWalletAddress, estimatedAmount.toString());
          setGasEstimate(gasEstimateValue);
        } catch (error) {
          console.error("Error estimating gas:", error);
          setGasEstimate(null);
        }
      } else {
        setGasEstimate(null);
      }
    };

    updateGasEstimate();
  }, [watchWalletAddress, watchAmount, watchTransferType, conversionResult]);

  const internationalPaymentMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      // Log what would be sent to API
      console.log("Mock API call with values:", values);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock transaction ID
      const transactionId = "tx-" + Math.random().toString(36).substring(2, 10);
      
      // Calculate fees based on constant percentages
      let fee = 0;
      if (values.transferType === "bank") {
        // Constant 4% for bank transfers plus flat fee
        const bankFeePercentage = 0.04;
        fee = (values.amount * bankFeePercentage) + 500;
      } else {
        // Constant 0.6% for crypto transfers
        const cryptoFeePercentage = 0.006;
        fee = values.amount * cryptoFeePercentage;
      }

      // Create mock transaction details
      return {
        transaction: {
          id: transactionId,
          type: values.transferType,
          status: "pending",
          amount: values.amount,
          fee: fee,
          fromCurrency: values.sourceCurrency,
          toCurrency: values.transferType === "bank" ? values.targetCurrency : "ETH",
          recipient: values.transferType === "bank" ? values.recipientName : values.walletAddress,
          accountNumber: values.accountNumber,
          bankName: values.bankName,
          swiftCode: values.swiftCode,
          recipientCountry: values.recipientCountry,
          processingTime: values.transferType === "bank" ? "2-5 business days" : "~15 seconds",
          createdAt: new Date().toISOString(),
          estimatedArrival: values.transferType === "bank" 
            ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from now
            : new Date(Date.now() + 2 * 60 * 1000).toISOString(), // 2 minutes from now
        }
      };
    },
    onSuccess: (data) => {
      setTransactionDetails(data.transaction);
      setShowProcessing(false);
      setShowSuccess(true);

      toast({
        title: `International Transfer Initiated`,
        description: formValues?.transferType === "bank"
          ? `Your bank transfer has been initiated. Funds will arrive in 2-5 business days.`
          : `Your ${watchSourceCurrency} has been converted and sent via blockchain. Transaction confirmed.`,
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
    setShowSecurityCheck(true);
  };

  const handleSecurityVerificationComplete = (success: boolean) => {
    setShowSecurityCheck(false);

    if (success && formValues) {
      setShowProcessing(true);
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
                                  Enter an Ethereum or Stellar wallet address.
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
                              <span className="text-xs text-green-600">Real-time Binance rate</span>
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
                      All fees shown in Indian Rupees (₹). Exchange rates updated in real-time. 
                      Cryptocurrency transfers use a flat 0.6% fee vs. bank fees of 4% plus ₹500 fixed charge.
                      Actual rates may vary at time of transaction.
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
