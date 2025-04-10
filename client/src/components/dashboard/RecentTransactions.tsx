import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/queryClient";

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

export default function RecentTransactions() {
  const { user } = useAuth();
  const userId = user?.id;

  const { data, isLoading, error } = useQuery<{ transactions: Transaction[] }>({
    queryKey: [`/api/users/${userId}/recent-transactions?limit=4`],
    enabled: !!userId,
  });

  if (isLoading) {
    return <TransactionsSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>There was an error loading your transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">Error: {(error as Error).message}</p>
        </CardContent>
      </Card>
    );
  }

  const transactions = data?.transactions || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest financial activities</CardDescription>
        </div>
        <Link href="/transactions" className="text-primary hover:text-primary/90 text-sm font-medium">
          View All
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">
              You don't have any transactions yet
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
      </CardContent>
    </Card>
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

  return (
    <div className="flex items-center justify-between p-4 border rounded-md hover:bg-gray-50">
      <div className="flex items-center">
        <div className={`flex items-center justify-center h-10 w-10 rounded-full ${
          isIncoming ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'
        } mr-4`}>
          {isIncoming ? <ArrowDownIcon className="h-5 w-5" /> : <ArrowUpIcon className="h-5 w-5" />}
        </div>
        <div>
          <h4 className="text-gray-800 font-medium">{getName()}</h4>
          <p className="text-gray-500 text-sm">
            {formatDate(transaction.createdAt)} • {transaction.type}
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
}

function TransactionsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle><Skeleton className="h-6 w-48" /></CardTitle>
        <CardDescription><Skeleton className="h-4 w-64" /></CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-md">
              <div className="flex items-center">
                <Skeleton className="h-10 w-10 rounded-full mr-4" />
                <div>
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="text-right">
                <Skeleton className="h-5 w-20 mb-1" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
