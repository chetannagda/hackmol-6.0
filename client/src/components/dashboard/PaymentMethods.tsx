import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Smartphone, Building, Phone, Globe } from "lucide-react";
import UpiPaymentModal from "@/components/payments/UpiPaymentModal";
import BankTransferModal from "@/components/payments/BankTransferModal";
import InternationalPaymentModal from "@/components/payments/InternationalPaymentModal";

interface PaymentMethod {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function PaymentMethods() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const paymentMethods: PaymentMethod[] = [
    {
      id: "upi",
      title: "UPI Payment",
      description: "Pay directly via UPI ID",
      icon: <Smartphone className="h-5 w-5" />,
    },
    {
      id: "bank",
      title: "Bank Transfer",
      description: "Transfer to bank accounts",
      icon: <Building className="h-5 w-5" />,
    },
    {
      id: "mobile",
      title: "Mobile Number",
      description: "Pay via registered mobile",
      icon: <Phone className="h-5 w-5" />,
    },
    {
      id: "international",
      title: "International",
      description: "Send money abroad securely",
      icon: <Globe className="h-5 w-5" />,
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

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Send Money</CardTitle>
          <CardDescription>Choose your preferred payment method</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
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

      {/* Payment Modals */}
      <UpiPaymentModal isOpen={activeModal === 'upi'} onClose={closeModal} />
      <BankTransferModal isOpen={activeModal === 'bank'} onClose={closeModal} />
      <InternationalPaymentModal isOpen={activeModal === 'international'} onClose={closeModal} />
    </>
  );
}
