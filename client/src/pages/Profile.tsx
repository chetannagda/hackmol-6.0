import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { User, CreditCard, Bell, Lock, RefreshCw, QrCode, ChevronRight } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [upiId, setUpiId] = useState(user?.upiId || "");
  const [isGeneratingUPI, setIsGeneratingUPI] = useState(false);

  const { data: statsData } = useQuery<{ stats: { spent: number, received: number } }>({
    queryKey: [`/api/users/${user?.id}/monthly-stats`],
    enabled: !!user?.id,
  });

  const handleGenerateUPI = () => {
    setIsGeneratingUPI(true);
    
    // Simulate API call to generate UPI ID
    setTimeout(() => {
      const generatedUpiId = `${user?.username?.toLowerCase() || 'user'}@paysafe`;
      setUpiId(generatedUpiId);
      setIsGeneratingUPI(false);
      
      toast({
        title: "UPI ID Generated",
        description: `Your new UPI ID: ${generatedUpiId}`,
      });
    }, 2000);
  };

  const mockChartData = [
    { name: 'Income', value: statsData?.stats.received || 0 },
    { name: 'Expenses', value: statsData?.stats.spent || 0 },
  ];

  const COLORS = ['#10b981', '#ef4444'];

  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account and preferences</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                  <div className="flex-1">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue={user?.firstName} />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue={user?.lastName} />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user?.email} />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" defaultValue={user?.phone} />
                </div>
                
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" defaultValue={user?.username} />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
            
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Account Statistics</CardTitle>
                <CardDescription>Your financial overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="md:w-1/2">
                    <h3 className="text-lg font-medium mb-4">Monthly Overview</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={mockChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {mockChartData.map((entry, index) => (
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
                        <div className="h-3 w-3 rounded-full bg-emerald-500 mr-2"></div>
                        <span className="text-sm text-gray-600">
                          Income: {formatCurrency(statsData?.stats.received || 0)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                        <span className="text-sm text-gray-600">
                          Expenses: {formatCurrency(statsData?.stats.spent || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:w-1/2">
                    <h3 className="text-lg font-medium mb-4">Account Information</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between pb-2 border-b">
                        <span className="text-gray-600">Account Balance</span>
                        <span className="font-medium">{formatCurrency(user?.walletBalance || 0)}</span>
                      </div>
                      <div className="flex justify-between pb-2 border-b">
                        <span className="text-gray-600">Member Since</span>
                        <span className="font-medium">
                          {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                      {user?.upiId && (
                        <div className="flex justify-between pb-2 border-b">
                          <span className="text-gray-600">UPI ID</span>
                          <span className="font-medium">{user.upiId}</span>
                        </div>
                      )}
                      {user?.ethereumAddress && (
                        <div className="flex justify-between pb-2 border-b">
                          <span className="text-gray-600">Ethereum Address</span>
                          <span className="font-medium">
                            {user.ethereumAddress.substring(0, 6)}...{user.ethereumAddress.substring(user.ethereumAddress.length - 4)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Manage your payment options and UPI ID</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">UPI ID</h3>
                  <div className="flex items-end space-x-4">
                    <div className="flex-1">
                      <Label htmlFor="upi-id">Your UPI ID</Label>
                      <Input id="upi-id" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="Generate a UPI ID to receive payments" />
                    </div>
                    <Button onClick={handleGenerateUPI} disabled={isGeneratingUPI}>
                      {isGeneratingUPI ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <QrCode className="mr-2 h-4 w-4" />
                          Generate UPI ID
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Your UPI ID will be used to receive payments from other users.
                  </p>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-4">Ethereum Wallet</h3>
                  <div className="flex items-end space-x-4">
                    <div className="flex-1">
                      <Label htmlFor="eth-address">Ethereum Address</Label>
                      <Input 
                        id="eth-address" 
                        value={user?.ethereumAddress || ""} 
                        placeholder="Connect an Ethereum wallet" 
                        readOnly 
                      />
                    </div>
                    <Button variant="outline">
                      Connect Wallet
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Connect your Ethereum wallet for international payments.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                    <Button>Update Password</Button>
                  </div>
                </div>
                
                <div className="pt-6 border-t">
                  <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable 2FA</p>
                      <p className="text-sm text-gray-500">Add an additional layer of security to your account</p>
                    </div>
                    <Switch id="2fa" />
                  </div>
                </div>
                
                <div className="pt-6 border-t">
                  <h3 className="text-lg font-medium mb-4">Transaction PIN</h3>
                  <p className="mb-4 text-sm text-gray-500">
                    Set a 4-digit PIN for securing your transactions
                  </p>
                  <div className="flex space-x-2 mb-4">
                    <div className="flex items-center space-x-2">
                      <Input className="w-12 h-12 text-center text-xl" maxLength={1} inputMode="numeric" pattern="[0-9]*" />
                      <Input className="w-12 h-12 text-center text-xl" maxLength={1} inputMode="numeric" pattern="[0-9]*" />
                      <Input className="w-12 h-12 text-center text-xl" maxLength={1} inputMode="numeric" pattern="[0-9]*" />
                      <Input className="w-12 h-12 text-center text-xl" maxLength={1} inputMode="numeric" pattern="[0-9]*" />
                    </div>
                  </div>
                  <Button>Save PIN</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Transaction Alerts</p>
                      <p className="text-sm text-gray-500">Receive alerts for all transactions</p>
                    </div>
                    <Switch id="transaction-alerts" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Security Alerts</p>
                      <p className="text-sm text-gray-500">Get notified about security updates</p>
                    </div>
                    <Switch id="security-alerts" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Marketing Updates</p>
                      <p className="text-sm text-gray-500">Receive news and special offers</p>
                    </div>
                    <Switch id="marketing-updates" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Payment Reminders</p>
                      <p className="text-sm text-gray-500">Get reminders for pending payments</p>
                    </div>
                    <Switch id="payment-reminders" defaultChecked />
                  </div>
                </div>
                
                <div className="pt-6 border-t">
                  <h3 className="text-lg font-medium mb-4">Notification Methods</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                      <Switch id="email-notifications" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">SMS Notifications</p>
                        <p className="text-sm text-gray-500">{user?.phone}</p>
                      </div>
                      <Switch id="sms-notifications" defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>Save Preferences</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
