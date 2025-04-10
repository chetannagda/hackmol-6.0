import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDownIcon, ArrowUpIcon, SearchIcon, FilterIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Transaction {
  id: number;
  senderId: number;
  receiverId: number | null;
  receiverUpiId: string | null;
  receiverAccountNumber: string | null;
  receiverIfscCode: string | null;
  receiverEthAddress: string | null;
  amount: number;
  currency: string;
  type: 'UPI' | 'BANK' | 'INTERNATIONAL';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  note: string | null;
  createdAt: string;
}

export default function Transactions() {
  const { user } = useAuth();
  const userId = user?.id;
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, error } = useQuery<{ transactions: Transaction[] }>({
    queryKey: [`/api/users/${userId}/transactions`],
    enabled: !!userId,
  });

  if (isLoading) {
    return <TransactionsSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>There was an error loading your transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">Error: {(error as Error).message}</p>
        </CardContent>
      </Card>
    );
  }

  let transactions = data?.transactions || [];
  
  // Filter transactions
  if (filter !== "all") {
    transactions = transactions.filter(tx => tx.type === filter);
  }
  
  // Search transactions
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    transactions = transactions.filter(tx => 
      tx.receiverUpiId?.toLowerCase().includes(query) ||
      tx.receiverAccountNumber?.toLowerCase().includes(query) ||
      tx.receiverEthAddress?.toLowerCase().includes(query) ||
      tx.note?.toLowerCase().includes(query) ||
      tx.type.toLowerCase().includes(query) ||
      tx.status.toLowerCase().includes(query)
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
          <p className="text-gray-600 mt-1">View and manage your transaction history</p>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Transaction History</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search transactions..." 
                  className="pl-9 w-full sm:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="BANK">Bank Transfer</SelectItem>
                  <SelectItem value="INTERNATIONAL">International</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">
                No transactions found
              </p>
            ) : (
              transactions.map((transaction) => (
                <TransactionItem 
                  key={transaction.id} 
                  transaction={transaction} 
                  userId={userId!} 
                />
              ))
            )}
          </div>
          
          {transactions.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500">
                Showing {transactions.length} transactions
              </p>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" disabled>
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8" disabled>1</Button>
                <Button variant="outline" size="icon" disabled>
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface TransactionItemProps {
  transaction: Transaction;
  userId: number;
}

function TransactionItem({ transaction, userId }: TransactionItemProps) {
  const isIncoming = transaction.receiverId === userId;
  
  // Determine transaction name based on type and direction
  const getName = () => {
    if (isIncoming) {
      return transaction.type === 'UPI' 
        ? 'Received via UPI' 
        : transaction.type === 'BANK'
          ? 'Received via Bank Transfer'
          : 'Received International Payment';
    } else {
      if (transaction.type === 'UPI') {
        return `Paid to ${transaction.receiverUpiId}`;
      } else if (transaction.type === 'BANK') {
        return 'Bank Transfer';
      } else {
        return 'International Payment';
      }
    }
  };

  const getDetails = () => {
    if (transaction.type === 'UPI') {
      return transaction.receiverUpiId || 'UPI Payment';
    } else if (transaction.type === 'BANK') {
      return transaction.receiverAccountNumber ? `A/C: ${transaction.receiverAccountNumber}` : 'Bank Transfer';
    } else {
      return transaction.receiverEthAddress ? `ETH: ${transaction.receiverEthAddress.substring(0, 8)}...` : 'International';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-md hover:bg-gray-50">
      <div className="flex items-center">
        <div className={`flex items-center justify-center h-12 w-12 rounded-full ${
          isIncoming ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'
        } mr-4`}>
          {isIncoming ? <ArrowDownIcon className="h-5 w-5" /> : <ArrowUpIcon className="h-5 w-5" />}
        </div>
        <div>
          <h4 className="text-gray-800 font-medium">{getName()}</h4>
          <p className="text-gray-500 text-sm">
            {formatDate(transaction.createdAt)} • {transaction.type}
          </p>
          {transaction.note && (
            <p className="text-gray-600 text-sm mt-1 italic">"{transaction.note}"</p>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${isIncoming ? 'text-emerald-600' : 'text-red-600'}`}>
          {isIncoming ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency)}
        </p>
        <div className="flex items-center justify-end">
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            transaction.status === 'COMPLETED' 
              ? 'bg-emerald-100 text-emerald-700'
              : transaction.status === 'PENDING'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-red-100 text-red-700'
          }`}>
            {transaction.status.toLowerCase()}
          </span>
        </div>
        <p className="text-gray-500 text-xs mt-1">{getDetails()}</p>
      </div>
    </div>
  );
}

function TransactionsSkeleton() {
  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-40" />
            <div className="flex gap-3">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-md">
                <div className="flex items-center">
                  <Skeleton className="h-12 w-12 rounded-full mr-4" />
                  <div>
                    <Skeleton className="h-5 w-48 mb-1" />
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-5 w-24 mb-1" />
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
