import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { getEthereumProvider, getWalletAddress, getEthBalance, sendEthereum, convertCurrency } from "@/lib/ethereum";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Wallet, 
  PlusCircle, 
  ArrowUpRight, 
  RefreshCw, 
  Copy, 
  ChevronRight, 
  Clock,
  ArrowDownIcon,
  ArrowUpIcon
} from "lucide-react";

export default function WalletPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [addAmount, setAddAmount] = useState("");
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [ethAddress, setEthAddress] = useState<string | null>(null);
  const [ethBalance, setEthBalance] = useState<string | null>(null);

  const { data: transactionsData } = useQuery<{ transactions: any[] }>({
    queryKey: [`/api/users/${user?.id}/recent-transactions?limit=5`],
    enabled: !!user?.id,
  });

  const transactions = transactionsData?.transactions || [];

  const addFundsMutation = useMutation({
    mutationFn: async ({ amount }: { amount: number }) => {
      return await apiRequest("POST", `/api/users/${user?.id}/add-funds`, { amount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}`] });
      setIsAddMoneyOpen(false);
      setAddAmount("");
      toast({
        title: "Funds Added",
        description: `₹${parseFloat(addAmount).toFixed(2)} has been added to your wallet.`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to add funds",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    },
  });

  const handleAddMoney = () => {
    if (!addAmount || parseFloat(addAmount) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0.",
      });
      return;
    }

    addFundsMutation.mutate({ amount: parseFloat(addAmount) });
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0.",
      });
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (amount > (user?.walletBalance || 0)) {
      toast({
        variant: "destructive",
        title: "Insufficient Funds",
        description: "You don't have enough balance to withdraw this amount.",
      });
      return;
    }

    // TODO: Implement actual withdrawal logic here
    toast({
      title: "Withdrawal Initiated",
      description: `₹${amount.toFixed(2)} will be transferred to your bank account.`,
    });
    setIsWithdrawOpen(false);
    setWithdrawAmount("");
  };

  const connectEthereumWallet = async () => {
    setIsConnectingWallet(true);
    try {
      const address = await getWalletAddress();
      if (address) {
        setEthAddress(address);
        const balance = await getEthBalance(address);
        setEthBalance(balance);
        toast({
          title: "Wallet Connected",
          description: "Your Ethereum wallet has been connected successfully.",
        });
      } else {
        throw new Error("Failed to connect wallet");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast({
        variant: "destructive",
        title: "Wallet Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to Ethereum wallet",
      });
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Address copied to clipboard",
    });
  };

  const refreshEthBalance = async () => {
    if (!ethAddress) return;
    
    try {
      const balance = await getEthBalance(ethAddress);
      setEthBalance(balance);
      toast({
        title: "Balance Updated",
        description: "Your Ethereum balance has been refreshed.",
      });
    } catch (error) {
      console.error("Error refreshing balance:", error);
      toast({
        variant: "destructive",
        title: "Failed to Refresh",
        description: "Could not update Ethereum balance.",
      });
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Wallet</h1>
          <p className="text-gray-600 mt-1">Manage your funds and cryptocurrency</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>PaySafe Wallet</CardTitle>
            <CardDescription>Your digital wallet for all payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-primary/90 to-primary/70 rounded-lg p-6 text-white shadow-lg">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center">
                  <Wallet className="h-8 w-8 mr-2" />
                  <span className="text-xl font-bold">PaySafe</span>
                </div>
                <div className="text-sm opacity-75">
                  {user?.username}
                </div>
              </div>
              <div className="mb-1">Available Balance</div>
              <div className="text-3xl font-bold mb-4">
                {formatCurrency(user?.walletBalance || 0)}
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="secondary" 
                  className="bg-white text-primary hover:bg-gray-100"
                  onClick={() => setIsAddMoneyOpen(true)}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Money
                </Button>
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/20"
                  onClick={() => setIsWithdrawOpen(true)}
                >
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Withdraw
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Ethereum Wallet</CardTitle>
            <CardDescription>Manage your cryptocurrency</CardDescription>
          </CardHeader>
          <CardContent>
            {ethAddress ? (
              <>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="text-sm text-gray-500 mb-1">Wallet Address</div>
                  <div className="flex items-center">
                    <div className="text-sm font-medium truncate flex-1">
                      {ethAddress.substring(0, 10)}...{ethAddress.substring(ethAddress.length - 6)}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => copyToClipboard(ethAddress)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">ETH Balance</div>
                      <div className="font-medium">{ethBalance || "0.00"} ETH</div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={refreshEthBalance}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 text-gray-500 mb-4">
                  <Wallet className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Connect Your Wallet</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Connect your Ethereum wallet for international transactions
                </p>
                <Button onClick={connectEthereumWallet} disabled={isConnectingWallet}>
                  {isConnectingWallet ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect Wallet"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="settings">Wallet Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your most recent wallet activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No Transactions Yet</h3>
                    <p className="text-gray-500">
                      Your recent transactions will appear here
                    </p>
                  </div>
                ) : (
                  transactions.map((transaction) => {
                    const isIncoming = transaction.receiverId === user?.id;
                    
                    return (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-md hover:bg-gray-50">
                        <div className="flex items-center">
                          <div className={`flex items-center justify-center h-10 w-10 rounded-full ${
                            isIncoming ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'
                          } mr-4`}>
                            {isIncoming ? <ArrowDownIcon className="h-5 w-5" /> : <ArrowUpIcon className="h-5 w-5" />}
                          </div>
                          <div>
                            <h4 className="text-gray-800 font-medium">
                              {transaction.type === 'UPI' 
                                ? 'UPI Transaction' 
                                : transaction.type === 'BANK'
                                  ? 'Bank Transfer'
                                  : 'International Payment'
                              }
                            </h4>
                            <p className="text-gray-500 text-sm">
                              {new Date(transaction.createdAt).toLocaleDateString()} • {transaction.type}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${isIncoming ? 'text-emerald-600' : 'text-red-600'}`}>
                            {isIncoming ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency)}
                          </p>
                          <p className="text-gray-500 text-xs capitalize">{transaction.status.toLowerCase()}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-6">
              <Button variant="outline" className="w-full sm:w-auto">
                View All Transactions
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="payment-methods">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your payment options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-100 text-primary mr-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5"
                        >
                          <rect width="20" height="14" x="2" y="5" rx="2" />
                          <line x1="2" x2="22" y1="10" y2="10" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">Bank Accounts</h3>
                        <p className="text-gray-500 text-sm">Add or manage your bank accounts</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium">HDFC Bank</p>
                        <p className="text-gray-500 text-sm">••••••6789</p>
                      </div>
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        Primary
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-100 text-primary mr-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5"
                        >
                          <path d="M16 4H8a4 4 0 1 0 0 8h8a4 4 0 1 1 0 8H8" />
                          <line x1="16" x2="16" y1="4" y2="20" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">UPI</h3>
                        <p className="text-gray-500 text-sm">Manage your UPI IDs</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </div>
                  <div className="border-t pt-4">
                    {user?.upiId ? (
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <p className="font-medium">{user.upiId}</p>
                          <p className="text-gray-500 text-sm">PaySafe UPI</p>
                        </div>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <p className="text-gray-500">No UPI ID configured</p>
                        <Button variant="link" className="mt-1">
                          Add UPI ID
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-100 text-primary mr-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" x2="12" y1="8" y2="12" />
                          <line x1="12" x2="12.01" y1="16" y2="16" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">Ethereum Wallet</h3>
                        <p className="text-gray-500 text-sm">Manage your cryptocurrency wallet</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </div>
                  <div className="border-t pt-4">
                    {ethAddress ? (
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <p className="font-medium">
                            {ethAddress.substring(0, 6)}...{ethAddress.substring(ethAddress.length - 4)}
                          </p>
                          <p className="text-gray-500 text-sm">MetaMask</p>
                        </div>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                          Connected
                        </span>
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <p className="text-gray-500">No wallet connected</p>
                        <Button variant="link" className="mt-1" onClick={connectEthereumWallet}>
                          Connect Wallet
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Wallet Settings</CardTitle>
              <CardDescription>Configure your wallet preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-Add to Wallet</p>
                    <p className="text-sm text-gray-500">
                      Automatically add received funds to your wallet
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="auto-add" className="sr-only">
                      Auto-Add to Wallet
                    </Label>
                    <Input id="auto-add" type="checkbox" className="h-4 w-8" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Transaction Notifications</p>
                    <p className="text-sm text-gray-500">
                      Receive notifications for wallet transactions
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="transaction-notifications" className="sr-only">
                      Transaction Notifications
                    </Label>
                    <Input id="transaction-notifications" type="checkbox" className="h-4 w-8" defaultChecked />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Default Currency</p>
                    <p className="text-sm text-gray-500">
                      Set your preferred currency for transactions
                    </p>
                  </div>
                  <div className="w-32">
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option value="INR">INR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-Convert to INR</p>
                    <p className="text-sm text-gray-500">
                      Automatically convert received cryptocurrency to INR
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="auto-convert" className="sr-only">
                      Auto-Convert to INR
                    </Label>
                    <Input id="auto-convert" type="checkbox" className="h-4 w-8" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-6">
              <Button>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Add Money Dialog */}
      <Dialog open={isAddMoneyOpen} onOpenChange={setIsAddMoneyOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Money to Wallet</DialogTitle>
            <DialogDescription>
              Enter the amount you want to add to your wallet
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <div className="flex items-center p-3 border rounded-md">
                <div className="flex items-center justify-center h-8 w-8 rounded bg-gray-100 mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <line x1="2" x2="22" y1="10" y2="10" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">HDFC Bank</p>
                  <p className="text-xs text-gray-500">••••••6789</p>
                </div>
                <input
                  type="radio"
                  className="h-4 w-4"
                  name="payment-method"
                  defaultChecked
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMoneyOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMoney} disabled={addFundsMutation.isPending}>
              {addFundsMutation.isPending ? "Processing..." : "Add Money"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Withdraw Money Dialog */}
      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Withdraw Money</DialogTitle>
            <DialogDescription>
              Enter the amount you want to withdraw from your wallet
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="withdraw-amount">Amount (₹)</Label>
              <Input
                id="withdraw-amount"
                type="number"
                placeholder="0.00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Available Balance: {formatCurrency(user?.walletBalance || 0)}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Withdraw To</Label>
              <div className="flex items-center p-3 border rounded-md">
                <div className="flex items-center justify-center h-8 w-8 rounded bg-gray-100 mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <line x1="2" x2="22" y1="10" y2="10" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">HDFC Bank</p>
                  <p className="text-xs text-gray-500">••••••6789</p>
                </div>
                <input
                  type="radio"
                  className="h-4 w-4"
                  name="withdraw-method"
                  defaultChecked
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWithdrawOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleWithdraw}>
              Withdraw
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
