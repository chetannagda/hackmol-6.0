import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smartphone, Building, Phone, Globe } from "lucide-react";
import UpiPaymentModal from "@/components/payments/UpiPaymentModal";
import BankTransferModal from "@/components/payments/BankTransferModal";
import InternationalPaymentModal from "@/components/payments/InternationalPaymentModal";
import { useAuth } from "@/context/AuthContext";

interface PaymentMethod {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tabId: string;
}

export default function Payments() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const paymentMethods: PaymentMethod[] = [
    {
      id: "upi",
      title: "UPI Payment",
      description: "Pay directly via UPI ID",
      icon: <Smartphone className="h-5 w-5" />,
      tabId: "all",
    },
    {
      id: "bank",
      title: "Bank Transfer",
      description: "Transfer to bank accounts",
      icon: <Building className="h-5 w-5" />,
      tabId: "all",
    },
    {
      id: "mobile",
      title: "Mobile Number",
      description: "Pay via registered mobile",
      icon: <Phone className="h-5 w-5" />,
      tabId: "all",
    },
    {
      id: "international",
      title: "International",
      description: "Send money abroad securely",
      icon: <Globe className="h-5 w-5" />,
      tabId: "all",
    },
    {
      id: "upi",
      title: "UPI Payment",
      description: "Pay directly via UPI ID",
      icon: <Smartphone className="h-5 w-5" />,
      tabId: "domestic",
    },
    {
      id: "bank",
      title: "Bank Transfer",
      description: "Transfer to bank accounts",
      icon: <Building className="h-5 w-5" />,
      tabId: "domestic",
    },
    {
      id: "mobile",
      title: "Mobile Number",
      description: "Pay via registered mobile",
      icon: <Phone className="h-5 w-5" />,
      tabId: "domestic",
    },
    {
      id: "international",
      title: "International",
      description: "Send money abroad securely",
      icon: <Globe className="h-5 w-5" />,
      tabId: "international",
    },
  ];

  const handleMethodClick = (id: string) => {
    // For mobile payment, we'll use the UPI flow
    if (id === 'mobile') {
      setActiveModal('upi');
    } else {
      setActiveModal(id);
    }
  };

  const closeModal = () => setActiveModal(null);

  const filteredMethods = paymentMethods.filter(method => method.tabId === activeTab);

  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payments</h1>
          <p className="text-gray-600 mt-1">Send money securely with multiple payment options</p>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="all">All Methods</TabsTrigger>
          <TabsTrigger value="domestic">Domestic</TabsTrigger>
          <TabsTrigger value="international">International</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Choose a preferred method to send money</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {paymentMethods
                  .filter(method => method.tabId === "all")
                  .map((method, index) => (
                    <div
                      key={`${method.id}-${index}`}
                      className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition duration-200 cursor-pointer border-2 border-transparent hover:border-primary"
                      onClick={() => handleMethodClick(method.id)}
                    >
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-100 text-primary mb-4">
                        {method.icon}
                      </div>
                      <h3 className="text-gray-800 font-medium mb-2">{method.title}</h3>
                      <p className="text-gray-600 text-sm">{method.description}</p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="domestic" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Domestic Payments</CardTitle>
              <CardDescription>Send money within India</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {paymentMethods
                  .filter(method => method.tabId === "domestic")
                  .map((method, index) => (
                    <div
                      key={`${method.id}-${index}`}
                      className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition duration-200 cursor-pointer border-2 border-transparent hover:border-primary"
                      onClick={() => handleMethodClick(method.id)}
                    >
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-100 text-primary mb-4">
                        {method.icon}
                      </div>
                      <h3 className="text-gray-800 font-medium mb-2">{method.title}</h3>
                      <p className="text-gray-600 text-sm">{method.description}</p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="international" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>International Payments</CardTitle>
              <CardDescription>Send money abroad securely via Ethereum blockchain</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6">
                {paymentMethods
                  .filter(method => method.tabId === "international")
                  .map((method, index) => (
                    <div
                      key={`${method.id}-${index}`}
                      className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition duration-200 cursor-pointer border-2 border-transparent hover:border-primary"
                      onClick={() => handleMethodClick(method.id)}
                    >
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-100 text-primary mb-4">
                        {method.icon}
                      </div>
                      <h3 className="text-gray-800 font-medium mb-2">{method.title}</h3>
                      <p className="text-gray-600 text-sm">{method.description}</p>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Benefits of Blockchain Payments:</h4>
                        <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                          <li>Secure and transparent transactions</li>
                          <li>Lower fees compared to traditional methods</li>
                          <li>Fast settlement time</li>
                          <li>No need for intermediary banks</li>
                        </ul>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Features Section */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Payment Features</CardTitle>
            <CardDescription>Our secure payment platform offers multiple benefits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 text-primary mb-4 mx-auto">
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
                    className="h-6 w-6"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  </svg>
                </div>
                <h3 className="text-center text-gray-800 font-medium mb-2">Advanced Fraud Detection</h3>
                <p className="text-center text-gray-600 text-sm">
                  AI-powered fraud detection system to keep your money safe
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 text-primary mb-4 mx-auto">
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
                    className="h-6 w-6"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h3 className="text-center text-gray-800 font-medium mb-2">Secure Verification</h3>
                <p className="text-center text-gray-600 text-sm">
                  Multi-level verification system for high-value transactions
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 text-primary mb-4 mx-auto">
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
                    className="h-6 w-6"
                  >
                    <path d="m12 14 4-4" />
                    <path d="M3.34 19a10 10 0 1 1 17.32 0" />
                  </svg>
                </div>
                <h3 className="text-center text-gray-800 font-medium mb-2">Blockchain Technology</h3>
                <p className="text-center text-gray-600 text-sm">
                  Secure international transfers using Ethereum blockchain
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Modals */}
      <UpiPaymentModal isOpen={activeModal === 'upi'} onClose={closeModal} />
      <BankTransferModal isOpen={activeModal === 'bank'} onClose={closeModal} />
      <InternationalPaymentModal isOpen={activeModal === 'international'} onClose={closeModal} />
    </div>
  );
}
