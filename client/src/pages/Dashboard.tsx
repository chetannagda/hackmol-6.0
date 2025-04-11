import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import BalanceCard from "@/components/dashboard/BalanceCard";
import PaymentMethods from "@/components/dashboard/PaymentMethods";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import MonthlyOverview from "@/components/dashboard/MonthlyOverview";
import { Button } from "@/components/ui/button";
import { PlusIcon, ArrowUpRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAddMoneyDialogOpen, setIsAddMoneyDialogOpen] = useState(false);
  const [addAmount, setAddAmount] = useState("");
  const [stats, setStats] = useState({
    walletBalance: 0,
    monthlySpent: 0,
    monthlyReceived: 0,
    percentChangeSpent: 2.1,
    percentChangeReceived: 5.2,
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    },
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Fetch monthly stats
        const statsRes = await apiRequest("GET", `/api/users/${user.id}/monthly-stats`);
        const statsData = await statsRes.json();
        
        setStats({
          walletBalance: user.walletBalance,
          monthlySpent: statsData.stats.spent,
          monthlyReceived: statsData.stats.received,
          percentChangeSpent: 2.1, // Mock values for demo
          percentChangeReceived: 5.2, // Mock values for demo
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          variant: "destructive",
          title: "Failed to load dashboard",
          description: "There was an error loading your financial information.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, toast]);

  const handleAddMoney = () => {
    setIsAddMoneyDialogOpen(true);
  };

  const handleAddMoneySubmit = async () => {
    if (!user || !addAmount) return;

    const amount = parseFloat(addAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0.",
      });
      return;
    }

    try {
      toast({
        title: "Adding funds",
        description: "Processing your request...",
      });

      const response = await apiRequest("POST", `/api/users/${user.id}/add-funds`, { amount });
      const data = await response.json();

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}/monthly-stats`] });

      toast({
        title: "Funds added",
        description: `₹${amount.toLocaleString()} has been added to your wallet.`,
      });

      // Update local state
      setStats(prev => ({
        ...prev,
        walletBalance: data.user.walletBalance
      }));
      
      // Close dialog and reset input
      setIsAddMoneyDialogOpen(false);
      setAddAmount("");
    } catch (error) {
      console.error("Error adding funds:", error);
      toast({
        variant: "destructive",
        title: "Failed to add funds",
        description: "There was an error processing your request.",
      });
    }
  };

  return (
    <motion.div 
      className="container mx-auto px-4 py-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Welcome Section */}
      <motion.div 
        className="flex flex-col md:flex-row md:items-center justify-between mb-8 bg-gradient-to-r from-primary/10 to-transparent p-6 rounded-xl"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-700 bg-clip-text text-transparent">
            Welcome, {user ? `${user.firstName} ${user.lastName}` : 'User'}
          </h1>
          <p className="text-gray-600 mt-1">Your financial dashboard</p>
        </div>
        <motion.div 
          className="mt-4 md:mt-0"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            className="flex items-center bg-gradient-to-r from-primary to-blue-700 hover:from-primary/90 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-primary/40"
            onClick={handleAddMoney}
            size="lg"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Money
          </Button>
        </motion.div>
      </motion.div>
      
      {/* Add Money Dialog */}
      <Dialog open={isAddMoneyDialogOpen} onOpenChange={setIsAddMoneyDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-gradient-to-b from-white to-gray-50 border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">Add Money to Wallet</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right text-gray-700">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                className="col-span-3 focus:ring-2 focus:ring-primary/50 transition-all border-gray-300"
                min="1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={handleAddMoneySubmit}
              disabled={!addAmount || parseFloat(addAmount) <= 0}
              className="bg-gradient-to-r from-primary to-blue-700 hover:from-primary/90 hover:to-blue-800 transition-all duration-300"
            >
              Add Funds
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Balance Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        variants={itemVariants}
      >
        <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
          <BalanceCard 
            title="Available Balance" 
            amount={stats.walletBalance} 
            icon="wallet" 
            loading={loading}
          />
        </motion.div>
        <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
          <BalanceCard 
            title="This Month Spent" 
            amount={stats.monthlySpent} 
            percentChange={stats.percentChangeSpent} 
            icon="spent" 
            loading={loading}
          />
        </motion.div>
        <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
          <BalanceCard 
            title="This Month Received" 
            amount={stats.monthlyReceived} 
            percentChange={stats.percentChangeReceived} 
            icon="received" 
            loading={loading}
          />
        </motion.div>
      </motion.div>
      
      {/* Quick Actions */}
      <motion.div 
        className="mb-8 bg-gradient-to-r from-blue-50 to-gray-50 p-6 rounded-xl"
        variants={itemVariants}
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Send Money', 'Request Money', 'Pay Bills', 'Investments'].map((action, index) => (
            <motion.div
              key={index}
              className="bg-white p-4 rounded-lg shadow-md text-center cursor-pointer hover:bg-primary/5 transition-colors"
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1)" }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex justify-center mb-2">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-blue-600/20 flex items-center justify-center">
                  <ArrowUpRight className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="font-medium text-gray-800">{action}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      {/* Payment Methods */}
      <motion.div className="mb-8" variants={itemVariants}>
        <PaymentMethods />
      </motion.div>
      
      {/* Recent Transactions */}
      <motion.div className="mb-8" variants={itemVariants}>
        <RecentTransactions />
      </motion.div>
      
      {/* Monthly Overview */}
      <motion.div className="mb-8" variants={itemVariants}>
        <MonthlyOverview />
      </motion.div>
    </motion.div>
  );
}
