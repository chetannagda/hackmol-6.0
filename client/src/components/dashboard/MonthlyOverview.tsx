// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";
// import { useQuery } from "@tanstack/react-query";
// import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
// import { formatCurrency } from "@/lib/utils";
// import { useAuth } from "@/context/AuthContext";

// const COLORS = ['#6366f1', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

// interface SpendingCategory {
//   name: string;
//   amount: number;
//   percentage: number;
// }

// const mockSpendingCategories: SpendingCategory[] = [
//   { name: 'Shopping', amount: 9800, percentage: 65 },
//   { name: 'Food & Dining', amount: 7200, percentage: 45 },
//   { name: 'Utilities', amount: 4500, percentage: 30 },
//   { name: 'Entertainment', amount: 3800, percentage: 25 },
//   { name: 'Transportation', amount: 2950, percentage: 20 },
// ];

// export default function MonthlyOverview() {
//   const { user } = useAuth();
//   const userId = user?.id;

//   const { data, isLoading, error } = useQuery<{ stats: { spent: number, received: number } }>({
//     queryKey: [`/api/users/${userId}/monthly-stats`],
//     enabled: !!userId,
//   });

//   if (isLoading) {
//     return <MonthlyOverviewSkeleton />;
//   }

//   const stats = data?.stats || { spent: 25252, received: 10111 };
  
//   const chartData = [
//     { name: 'Income', value: stats.received },
//     { name: 'Expenses', value: stats.spent },
//   ];

//   const currentMonth = new Date().toLocaleString('default', { month: 'long' });
//   const currentYear = new Date().getFullYear();

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Monthly Overview</CardTitle>
//         <CardDescription>Financial activity for {currentMonth} {currentYear}</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Monthly Income & Expenses */}
//           <div>
//             <h3 className="text-gray-800 font-medium mb-4">Income & Expenses</h3>
//             <div className="h-64 bg-gray-50 rounded-lg">
//               <ResponsiveContainer width="100%" height="100%">
//                 <PieChart>
//                   <Pie
//                     data={chartData}
//                     cx="50%"
//                     cy="50%"
//                     labelLine={false}
//                     outerRadius={80}
//                     fill="#8884d8"
//                     dataKey="value"
//                     label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                   >
//                     {chartData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                     ))}
//                   </Pie>
//                   <Tooltip 
//                     formatter={(value: number) => formatCurrency(value)} 
//                   />
//                 </PieChart>
//               </ResponsiveContainer>
//             </div>
//             <div className="flex justify-between mt-4">
//               <div className="flex items-center">
//                 <div className="h-3 w-3 rounded-full bg-primary mr-2"></div>
//                 <span className="text-sm text-gray-600">
//                   Income: {formatCurrency(stats.received)}
//                 </span>
//               </div>
//               <div className="flex items-center">
//                 <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
//                 <span className="text-sm text-gray-600">
//                   Expenses: {formatCurrency(stats.spent)}
//                 </span>
//               </div>
//             </div>
//           </div>
          
//           {/* Spending Categories */}
//           <div>
//             <h3 className="text-gray-800 font-medium mb-4">Top Spending Categories</h3>
//             <div className="space-y-4">
//               {mockSpendingCategories.map((category, index) => (
//                 <div key={index}>
//                   <div className="flex justify-between mb-1">
//                     <span className="text-sm font-medium text-gray-700">{category.name}</span>
//                     <span className="text-sm font-medium text-gray-700">{formatCurrency(category.amount)}</span>
//                   </div>
//                   <div className="w-full bg-gray-200 rounded-full h-2">
//                     <div 
//                       className="bg-primary h-2 rounded-full" 
//                       style={{ width: `${category.percentage}%` }}
//                     ></div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// function MonthlyOverviewSkeleton() {
//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle><Skeleton className="h-6 w-40" /></CardTitle>
//         <CardDescription><Skeleton className="h-4 w-56" /></CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           <div>
//             <Skeleton className="h-5 w-40 mb-4" />
//             <Skeleton className="h-64 w-full rounded-lg mb-4" />
//             <div className="flex justify-between">
//               <Skeleton className="h-4 w-28" />
//               <Skeleton className="h-4 w-28" />
//             </div>
//           </div>
//           <div>
//             <Skeleton className="h-5 w-48 mb-4" />
//             <div className="space-y-4">
//               {[1, 2, 3, 4, 5].map((i) => (
//                 <div key={i}>
//                   <div className="flex justify-between mb-1">
//                     <Skeleton className="h-4 w-24" />
//                     <Skeleton className="h-4 w-16" />
//                   </div>
//                   <Skeleton className="h-2 w-full rounded-full" />
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

// Using the same color palette
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

  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/users/${userId}/monthly-stats`],
    queryFn: async () => {
      // Mock API call
      return new Promise<{ stats: { spent: number, received: number } }>(resolve => {
        setTimeout(() => {
          resolve({ stats: { spent: 25252, received: 45111 } });
        }, 1000);
      });
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return <MonthlyOverviewSkeleton />;
  }

  const stats = data?.stats || { spent: 25252, received: 45111 };
  
  // Use actual values for better data representation
  const total = stats.received + stats.spent;
  const chartData = [
    { name: 'Income', value: stats.received, actualValue: stats.received },
    { name: 'Expenses', value: stats.spent, actualValue: stats.spent },
  ];

  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();

  return (
    <Card className="shadow-lg border-0 overflow-hidden bg-white">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
        <CardTitle className="text-xl text-gray-800">Monthly Overview</CardTitle>
        <CardDescription className="text-gray-600">Financial activity for {currentMonth} {currentYear}</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Income & Expenses */}
          <div className="flex flex-col h-full">
            <h3 className="text-gray-800 font-medium mb-4 text-lg">Income & Expenses</h3>
            <div className="h-72 rounded-xl bg-slate-50 p-4 shadow-inner flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={90}
                    innerRadius={40}
                    paddingAngle={4}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => (
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    )}
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string, props: any) => [
                      formatCurrency(props.payload.actualValue),
                      name
                    ]}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                      border: '1px solid #f1f1f1'
                    }}
                    isAnimationActive={false}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    wrapperStyle={{
                      paddingTop: '10px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between mt-4 gap-4">
              <div className="flex-1 bg-blue-50 rounded-lg p-3 border border-blue-100 shadow-sm">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-primary mr-2"></div>
                  <span className="text-sm font-medium text-gray-700">Income</span>
                </div>
                <p className="text-lg font-semibold text-gray-800 mt-1">
                  {formatCurrency(stats.received)}
                </p>
              </div>
              <div className="flex-1 bg-red-50 rounded-lg p-3 border border-red-100 shadow-sm">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                  <span className="text-sm font-medium text-gray-700">Expenses</span>
                </div>
                <p className="text-lg font-semibold text-gray-800 mt-1">
                  {formatCurrency(stats.spent)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Spending Categories */}
          <div className="flex flex-col">
            <h3 className="text-gray-800 font-medium mb-4 text-lg">Top Spending Categories</h3>
            <div className="bg-slate-50 rounded-xl p-4 shadow-inner h-full">
              <div className="space-y-5">
                {mockSpendingCategories.map((category, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <div 
                          className="h-3 w-3 rounded-full mr-2" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="text-sm font-medium text-gray-700">{category.name}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-700">{formatCurrency(category.amount)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="h-2.5 rounded-full" 
                        style={{ 
                          width: `${category.percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      ></div>
                    </div>
                    <div className="mt-1 text-right">
                      <span className="text-xs text-gray-500">{category.percentage}% of total</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MonthlyOverviewSkeleton() {
  return (
    <Card className="shadow-lg border-0 overflow-hidden bg-white">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
        <CardTitle><Skeleton className="h-6 w-40" /></CardTitle>
        <CardDescription><Skeleton className="h-4 w-56" /></CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Skeleton className="h-5 w-40 mb-4" />
            <Skeleton className="h-72 w-full rounded-xl mb-4" />
            <div className="flex justify-between gap-4">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          </div>
          <div>
            <Skeleton className="h-5 w-48 mb-4" />
            <div className="space-y-5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
