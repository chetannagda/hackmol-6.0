import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const COLORS = ['#6366f1', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

interface SpendingCategory {
  name: string;
  amount: number;
  percentage: number;
}

const mockSpendingCategories: SpendingCategory[] = [
  { name: 'Shopping', amount: 9800, percentage: 65 },
  { name: 'Food & Dining', amount: 7200, percentage: 45 },
  { name: 'Utilities', amount: 4500, percentage: 30 },
  { name: 'Entertainment', amount: 3800, percentage: 25 },
  { name: 'Transportation', amount: 2950, percentage: 20 },
];

export default function MonthlyOverview() {
  const { user } = useAuth();
  const userId = user?.id;

  const { data, isLoading, error } = useQuery<{ stats: { spent: number, received: number } }>({
    queryKey: [`/api/users/${userId}/monthly-stats`],
    enabled: !!userId,
  });

  if (isLoading) {
    return <MonthlyOverviewSkeleton />;
  }

  const stats = data?.stats || { spent: 0, received: 0 };
  
  const chartData = [
    { name: 'Income', value: stats.received },
    { name: 'Expenses', value: stats.spent },
  ];

  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Overview</CardTitle>
        <CardDescription>Financial activity for {currentMonth} {currentYear}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Income & Expenses */}
          <div>
            <h3 className="text-gray-800 font-medium mb-4">Income & Expenses</h3>
            <div className="h-64 bg-gray-50 rounded-lg">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between mt-4">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-primary mr-2"></div>
                <span className="text-sm text-gray-600">
                  Income: {formatCurrency(stats.received)}
                </span>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                <span className="text-sm text-gray-600">
                  Expenses: {formatCurrency(stats.spent)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Spending Categories */}
          <div>
            <h3 className="text-gray-800 font-medium mb-4">Top Spending Categories</h3>
            <div className="space-y-4">
              {mockSpendingCategories.map((category, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{category.name}</span>
                    <span className="text-sm font-medium text-gray-700">{formatCurrency(category.amount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MonthlyOverviewSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle><Skeleton className="h-6 w-40" /></CardTitle>
        <CardDescription><Skeleton className="h-4 w-56" /></CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <Skeleton className="h-5 w-40 mb-4" />
            <Skeleton className="h-64 w-full rounded-lg mb-4" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
          <div>
            <Skeleton className="h-5 w-48 mb-4" />
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
