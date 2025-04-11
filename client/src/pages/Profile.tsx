import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { User, CreditCard, Bell, Lock, RefreshCw, QrCode, ChevronRight, Shield, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [upiId, setUpiId] = useState(user?.upiId || "");
  const [isGeneratingUPI, setIsGeneratingUPI] = useState(false);
  const [animateBackground, setAnimateBackground] = useState(false);

  useEffect(() => {
    setAnimateBackground(true);
  }, []);

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
    <div className="min-h-screen py-12 px-4 sm:px-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.08 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
        />
        <svg className="absolute top-0 left-0 w-full h-full opacity-5" viewBox="0 0 100 100" preserveAspectRatio="none">
          <motion.path 
            d="M0,0 L100,0 L100,100 L0,100 Z" 
            fill="none" 
            stroke="white" 
            strokeWidth="0.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />
          {[...Array(20)].map((_, i) => (
            <motion.circle 
              key={i} 
              cx={Math.random() * 100} 
              cy={Math.random() * 100} 
              r={Math.random() * 2 + 0.5}
              fill="white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ delay: i * 0.1, duration: 2 }}
            />
          ))}
        </svg>
      </div>

      <div className="container mx-auto max-w-6xl backdrop-blur-sm">
        <motion.div 
          className="flex flex-col md:flex-row md:items-center justify-between mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">Profile</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2 font-light text-lg">Manage your account and preferences</p>
          </div>
          <div className="flex items-center mt-4 md:mt-0 space-x-2">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 gap-8">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-10 rounded-xl p-1 backdrop-blur-md bg-white/20 dark:bg-gray-800/30 shadow-xl border border-white/20">
              <TabsTrigger 
                value="personal" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
              >
                <User className="h-4 w-4 mr-2" />
                Personal
              </TabsTrigger>
              <TabsTrigger 
                value="payments" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Payments
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
              >
                <Shield className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
              >
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="backdrop-blur-md bg-white/70 dark:bg-gray-800/50 border border-white/20 shadow-xl rounded-2xl overflow-hidden">
                  <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
                    <CardTitle className="text-xl text-indigo-700 dark:text-indigo-300 flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                      <div className="flex-1">
                        <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name</Label>
                        <Input id="firstName" defaultValue={user?.firstName} className="mt-1 border-indigo-100 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-lg" />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</Label>
                        <Input id="lastName" defaultValue={user?.lastName} className="mt-1 border-indigo-100 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-lg" />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</Label>
                      <Input id="email" type="email" defaultValue={user?.email} className="mt-1 border-indigo-100 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-lg" />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</Label>
                      <Input id="phone" defaultValue={user?.phone} className="mt-1 border-indigo-100 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-lg" />
                    </div>
                    
                    <div>
                      <Label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">Username</Label>
                      <Input id="username" defaultValue={user?.username} className="mt-1 border-indigo-100 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-lg" />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end border-t border-gray-100 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 py-4">
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition-all duration-300 shadow-md hover:shadow-lg">Save Changes</Button>
                  </CardFooter>
                </Card>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-10"
              >
                <Card className="backdrop-blur-md bg-white/70 dark:bg-gray-800/50 border border-white/20 shadow-xl rounded-2xl overflow-hidden">
                  <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
                    <CardTitle className="text-xl text-indigo-700 dark:text-indigo-300 flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Account Statistics
                    </CardTitle>
                    <CardDescription>Your financial overview</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="md:w-1/2">
                        <h3 className="text-lg font-medium mb-4 text-indigo-700 dark:text-indigo-300">Monthly Overview</h3>
                        <div className="h-64 p-2 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl">
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
                                contentStyle={{ 
                                  backgroundColor: 'rgba(255, 255, 255, 0.85)', 
                                  borderRadius: '8px', 
                                  border: 'none', 
                                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex justify-between mt-6 px-4 py-3 bg-white/50 dark:bg-gray-800/30 rounded-xl">
                          <div className="flex items-center">
                            <div className="h-3 w-3 rounded-full bg-emerald-500 mr-2"></div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              Income: {formatCurrency(statsData?.stats.received || 0)}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              Expenses: {formatCurrency(statsData?.stats.spent || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="md:w-1/2">
                        <h3 className="text-lg font-medium mb-4 text-indigo-700 dark:text-indigo-300">Account Information</h3>
                        <div className="space-y-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800/50 dark:to-gray-700/50 p-6 rounded-xl">
                          <div className="flex justify-between items-center pb-3 border-b border-indigo-100 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400">Account Balance</span>
                            <span className="font-medium text-lg text-indigo-700 dark:text-indigo-300">{formatCurrency(user?.walletBalance || 0)}</span>
                          </div>
                          <div className="flex justify-between items-center pb-3 border-b border-indigo-100 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400">Member Since</span>
                            <span className="font-medium text-indigo-700 dark:text-indigo-300">
                              {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                            </span>
                          </div>
                          {user?.upiId && (
                            <div className="flex justify-between items-center pb-3 border-b border-indigo-100 dark:border-gray-700">
                              <span className="text-gray-600 dark:text-gray-400">UPI ID</span>
                              <span className="font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-gray-700 px-3 py-1 rounded-full">{user.upiId}</span>
                            </div>
                          )}
                          {user?.ethereumAddress && (
                            <div className="flex justify-between items-center pb-3 border-b border-indigo-100 dark:border-gray-700">
                              <span className="text-gray-600 dark:text-gray-400">Ethereum Address</span>
                              <span className="font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-gray-700 px-3 py-1 rounded-full">
                                {user.ethereumAddress.substring(0, 6)}...{user.ethereumAddress.substring(user.ethereumAddress.length - 4)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="payments">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="backdrop-blur-md bg-white/70 dark:bg-gray-800/50 border border-white/20 shadow-xl rounded-2xl overflow-hidden">
                  <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
                    <CardTitle className="text-xl text-indigo-700 dark:text-indigo-300 flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Payment Methods
                    </CardTitle>
                    <CardDescription>Manage your payment options and UPI ID</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8 pt-6">
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800/50 dark:to-gray-700/50 p-6 rounded-xl">
                      <h3 className="text-lg font-medium mb-4 text-indigo-700 dark:text-indigo-300 flex items-center">
                        <QrCode className="h-4 w-4 mr-2" />
                        UPI ID
                      </h3>
                      <div className="flex items-end space-x-4">
                        <div className="flex-1">
                          <Label htmlFor="upi-id" className="text-sm font-medium text-gray-700 dark:text-gray-300">Your UPI ID</Label>
                          <Input 
                            id="upi-id" 
                            value={upiId} 
                            onChange={(e) => setUpiId(e.target.value)} 
                            placeholder="Generate a UPI ID to receive payments" 
                            className="mt-1 border-indigo-100 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-lg"
                          />
                        </div>
                        <Button 
                          onClick={handleGenerateUPI} 
                          disabled={isGeneratingUPI}
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition-all duration-300 shadow-md hover:shadow-lg"
                        >
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
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Your UPI ID will be used to receive payments from other users.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800/50 dark:to-gray-700/50 p-6 rounded-xl">
                      <h3 className="text-lg font-medium mb-4 text-indigo-700 dark:text-indigo-300 flex items-center">
                        <Wallet className="h-4 w-4 mr-2" />
                        Ethereum Wallet
                      </h3>
                      <div className="flex items-end space-x-4">
                        <div className="flex-1">
                          <Label htmlFor="eth-address" className="text-sm font-medium text-gray-700 dark:text-gray-300">Ethereum Address</Label>
                          <Input 
                            id="eth-address" 
                            value={user?.ethereumAddress || ""} 
                            placeholder="Connect an Ethereum wallet" 
                            readOnly
                            className="mt-1 border-indigo-100 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-lg font-mono text-sm"
                          />
                        </div>
                        <Button 
                          variant="outline"
                          className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-600 dark:text-indigo-400 dark:hover:bg-indigo-900/30 transition-all duration-300"
                        >
                          Connect Wallet
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Connect your Ethereum wallet for international payments.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="security">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="backdrop-blur-md bg-white/70 dark:bg-gray-800/50 border border-white/20 shadow-xl rounded-2xl overflow-hidden">
                  <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
                    <CardTitle className="text-xl text-indigo-700 dark:text-indigo-300 flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Security Settings
                    </CardTitle>
                    <CardDescription>Manage your account security</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8 pt-6">
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800/50 dark:to-gray-700/50 p-6 rounded-xl">
                      <h3 className="text-lg font-medium mb-4 text-indigo-700 dark:text-indigo-300 flex items-center">
                        <Lock className="h-4 w-4 mr-2" />
                        Change Password
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="current-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</Label>
                          <Input 
                            id="current-password" 
                            type="password" 
                            className="mt-1 border-indigo-100 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-lg"
                          />
                        </div>
                        <div>
                          <Label htmlFor="new-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">New Password</Label>
                          <Input 
                            id="new-password" 
                            type="password"
                            className="mt-1 border-indigo-100 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-lg" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</Label>
                          <Input 
                            id="confirm-password" 
                            type="password"
                            className="mt-1 border-indigo-100 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-lg" 
                          />
                        </div>
                        <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition-all duration-300 shadow-md hover:shadow-lg">
                          Update Password
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800/50 dark:to-gray-700/50 p-6 rounded-xl">
                      <h3 className="text-lg font-medium mb-4 text-indigo-700 dark:text-indigo-300">Two-Factor Authentication</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-200">Enable 2FA</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Add an additional layer of security to your account</p>
                        </div>
                        <Switch id="2fa" className="data-[state=checked]:bg-indigo-600" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800/50 dark:to-gray-700/50 p-6 rounded-xl">
                      <h3 className="text-lg font-medium mb-4 text-indigo-700 dark:text-indigo-300">Transaction PIN</h3>
                      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                        Set a 4-digit PIN for securing your transactions
                      </p>
                      <div className="flex space-x-3 mb-4 justify-center">
                        <Input className="w-14 h-14 text-center text-xl bg-white/70 dark:bg-gray-800/70 border-indigo-100 dark:border-gray-700 rounded-xl shadow-inner" maxLength={1} inputMode="numeric" pattern="[0-9]*" />
                        <Input className="w-14 h-14 text-center text-xl bg-white/70 dark:bg-gray-800/70 border-indigo-100 dark:border-gray-700 rounded-xl shadow-inner" maxLength={1} inputMode="numeric" pattern="[0-9]*" />
                        <Input className="w-14 h-14 text-center text-xl bg-white/70 dark:bg-gray-800/70 border-indigo-100 dark:border-gray-700 rounded-xl shadow-inner" maxLength={1} inputMode="numeric" pattern="[0-9]*" />
                        <Input className="w-14 h-14 text-center text-xl bg-white/70 dark:bg-gray-800/70 border-indigo-100 dark:border-gray-700 rounded-xl shadow-inner" maxLength={1} inputMode="numeric" pattern="[0-9]*" />
                      </div>
                      <div className="flex justify-center">
                        <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition-all duration-300 shadow-md hover:shadow-lg">
                          Save PIN
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="notifications">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="backdrop-blur-md bg-white/70 dark:bg-gray-800/50 border border-white/20 shadow-xl rounded-2xl overflow-hidden">
                  <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
                    <CardTitle className="text-xl text-indigo-700 dark:text-indigo-300 flex items-center">
                      <Bell className="h-5 w-5 mr-2" />
                      Notification Preferences
                    </CardTitle>
                    <CardDescription>Manage how you receive notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8 pt-6">
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800/50 dark:to-gray-700/50 p-6 rounded-xl">
                      <h3 className="text-lg font-medium mb-4 text-indigo-700 dark:text-indigo-300">Alert Settings</h3>
                      <div className="space-y-5">
                        <div className="flex items-center justify-between p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg transition-all hover:shadow-md">
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200">Transaction Alerts</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Receive alerts for all transactions</p>
                          </div>
                          <Switch id="transaction-alerts" defaultChecked className="data-[state=checked]:bg-indigo-600" />
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg transition-all hover:shadow-md">
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200">Security Alerts</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about security updates</p>
                          </div>
                          <Switch id="security-alerts" defaultChecked className="data-[state=checked]:bg-indigo-600" />
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg transition-all hover:shadow-md">
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200">Marketing Updates</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Receive news and special offers</p>
                          </div>
                          <Switch id="marketing-updates" className="data-[state=checked]:bg-indigo-600" />
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg transition-all hover:shadow-md">
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200">Payment Reminders</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Get reminders for pending payments</p>
                          </div>
                          <Switch id="payment-reminders" defaultChecked className="data-[state=checked]:bg-indigo-600" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800/50 dark:to-gray-700/50 p-6 rounded-xl">
                      <h3 className="text-lg font-medium mb-4 text-indigo-700 dark:text-indigo-300">Notification Methods</h3>
                      <div className="space-y-5">
                        <div className="flex items-center justify-between p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg transition-all hover:shadow-md">
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200">Email Notifications</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                          </div>
                          <Switch id="email-notifications" defaultChecked className="data-[state=checked]:bg-indigo-600" />
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg transition-all hover:shadow-md">
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200">SMS Notifications</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.phone}</p>
                          </div>
                          <Switch id="sms-notifications" defaultChecked className="data-[state=checked]:bg-indigo-600" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end border-t border-gray-100 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 py-4">
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition-all duration-300 shadow-md hover:shadow-lg">Save Preferences</Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
