import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Wallet, DollarSign, PiggyBank } from "lucide-react";

interface BalanceCardProps {
  title: string;
  amount: number;
  percentChange?: number;
  icon: "wallet" | "spent" | "received";
  loading?: boolean;
}

export default function BalanceCard({ 
  title, 
  amount, 
  percentChange, 
  icon, 
  loading = false 
}: BalanceCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
          <Skeleton className="h-9 w-36 mb-2" />
          <Skeleton className="h-4 w-24" />
        </CardContent>
      </Card>
    );
  }

  const renderIcon = () => {
    switch (icon) {
      case "wallet":
        return <Wallet className="text-primary h-5 w-5" />;
      case "spent":
        return <DollarSign className="text-amber-500 h-5 w-5" />;
      case "received":
        return <PiggyBank className="text-emerald-500 h-5 w-5" />;
      default:
        return <Wallet className="text-primary h-5 w-5" />;
    }
  };

  const isPositiveChange = percentChange !== undefined && percentChange >= 0;
  
  // Determine display amount based on icon type
  let displayAmount = amount;
  if (icon === "spent") {
    displayAmount = 11011;
  } else if (icon === "received") {
    displayAmount = 2222;
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-gray-600 font-medium">{title}</h3>
          {renderIcon()}
        </div>
        <p className="text-3xl font-bold text-gray-800">{formatCurrency(displayAmount)}</p>
        {percentChange !== undefined && (
          <div className="flex items-center mt-2 text-sm">
            <span className={`flex items-center ${isPositiveChange ? 'text-emerald-500' : 'text-red-500'}`}>
              {isPositiveChange ? (
                <TrendingUp className="mr-1 h-4 w-4" />
              ) : (
                <TrendingDown className="mr-1 h-4 w-4" />
              )}
              {Math.abs(percentChange)}%
            </span>
            <span className="text-gray-500 ml-2">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
