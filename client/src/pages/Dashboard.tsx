import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import BalanceCard from "@/components/dashboard/BalanceCard";
import PaymentMethods from "@/components/dashboard/PaymentMethods";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import MonthlyOverview from "@/components/dashboard/MonthlyOverview";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    walletBalance: 0,
    monthlySpent: 0,
    monthlyReceived: 0,
    percentChangeSpent: 2.1,
    percentChangeReceived: 5.2,
  });

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

  const handleAddMoney = async () => {
    if (!user) return;

    try {
      toast({
        title: "Adding funds",
        description: "Processing your request...",
      });

      // For demo purposes, add 5000 to wallet
      const response = await apiRequest("POST", `/api/users/${user.id}/add-funds`, { amount: 5000 });
      const data = await response.json();

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}/monthly-stats`] });

      toast({
        title: "Funds added",
        description: `₹5,000 has been added to your wallet.`,
      });

      // Update local state
      setStats(prev => ({
        ...prev,
        walletBalance: data.user.walletBalance
      }));
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
    <div className="container mx-auto">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome, {user ? `${user.firstName} ${user.lastName}` : 'User'}
          </h1>
          <p className="text-gray-600 mt-1">Your financial dashboard</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            className="flex items-center"
            onClick={handleAddMoney}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Money
          </Button>
        </div>
      </div>
      
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <BalanceCard 
          title="Available Balance" 
          amount={stats.walletBalance} 
          icon="wallet" 
          loading={loading}
        />
        <BalanceCard 
          title="This Month Spent" 
          amount={stats.monthlySpent} 
          percentChange={stats.percentChangeSpent} 
          icon="spent" 
          loading={loading}
        />
        <BalanceCard 
          title="This Month Received" 
          amount={stats.monthlyReceived} 
          percentChange={stats.percentChangeReceived} 
          icon="received" 
          loading={loading}
        />
      </div>
      
      {/* Payment Methods */}
      <div className="mb-8">
        <PaymentMethods />
      </div>
      
      {/* Recent Transactions */}
      <div className="mb-8">
        <RecentTransactions />
      </div>
      
      {/* Monthly Overview */}
      <div className="mb-8">
        <MonthlyOverview />
      </div>
    </div>
  );
}
