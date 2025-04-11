import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Smartphone, Building, Phone, Globe, ChevronRight, ArrowRight } from "lucide-react";
import UpiPaymentModal from "@/components/payments/UpiPaymentModal";
import BankTransferModal from "@/components/payments/BankTransferModal";
import InternationalPaymentModal from "@/components/payments/InternationalPaymentModal";
import { motion, AnimatePresence } from "framer-motion";

interface PaymentMethod {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  bgColor: string; // Added for better color control
}

export default function PaymentMethods() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [hoveredMethod, setHoveredMethod] = useState<string | null>(null);

  const paymentMethods: PaymentMethod[] = [
    {
      id: "upi",
      title: "UPI Payment",
      description: "Pay directly via UPI ID",
      icon: <Smartphone className="h-5 w-5" />,
      color: "text-indigo-600",
      gradient: "from-indigo-500/10 to-indigo-400/5",
      bgColor: "bg-indigo-500",
    },
    {
      id: "bank",
      title: "Bank Transfer",
      description: "Transfer to bank accounts",
      icon: <Building className="h-5 w-5" />,
      color: "text-blue-600",
      gradient: "from-blue-500/10 to-blue-400/5",
      bgColor: "bg-blue-500",
    },
    {
      id: "mobile",
      title: "Mobile Number",
      description: "Pay via registered mobile",
      icon: <Phone className="h-5 w-5" />,
      color: "text-emerald-600",
      gradient: "from-emerald-500/10 to-emerald-400/5",
      bgColor: "bg-emerald-500",
    },
    {
      id: "international",
      title: "International",
      description: "Send money abroad securely",
      icon: <Globe className="h-5 w-5" />,
      color: "text-amber-600",
      gradient: "from-amber-500/10 to-amber-400/5",
      bgColor: "bg-amber-500",
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  };

  const iconVariants = {
    hidden: { scale: 0.8, rotate: -10 },
    visible: { scale: 1, rotate: 0 },
    hover: { scale: 1.2, rotate: 5 },
  };

  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-700 bg-clip-text text-transparent">
              Send Money
            </CardTitle>
            <CardDescription className="text-gray-600">
              Choose your preferred payment method
            </CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={containerVariants}
            >
              {paymentMethods.map((method) => (
                <motion.div
                  key={method.id}
                  className="relative overflow-hidden rounded-xl p-6 cursor-pointer
                    bg-gradient-to-br border-0 shadow-md
                    transform transition-all duration-300"
                  style={{
                    backgroundImage: `linear-gradient(to bottom right, 
                                     ${hoveredMethod === method.id ? `rgba(${getColorValues(method.id)}, 0.15)` : `rgba(${getColorValues(method.id)}, 0.05)`}, 
                                     rgba(${getColorValues(method.id)}, 0.02))`,
                    boxShadow: hoveredMethod === method.id 
                      ? `0 10px 25px -5px rgba(${getColorValues(method.id)}, 0.2)` 
                      : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  variants={itemVariants}
                  onClick={() => handleMethodClick(method.id)}
                  onMouseEnter={() => setHoveredMethod(method.id)}
                  onMouseLeave={() => setHoveredMethod(null)}
                  whileHover={{
                    scale: 1.03,
                    y: -5,
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  {/* Background decorative elements */}
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-gradient-to-br from-transparent to-white/30 opacity-20" />
                  
                  {/* Floating particles that appear on hover */}
                  {hoveredMethod === method.id && (
                    <>
                      <motion.div 
                        className={`absolute w-2 h-2 rounded-full ${method.bgColor}/30`}
                        initial={{ top: "20%", left: "80%", opacity: 0 }}
                        animate={{ 
                          top: ["20%", "15%", "20%"],
                          left: ["80%", "75%", "80%"],
                          opacity: [0, 1, 0]
                        }}
                        transition={{ duration: 3, repeat: Infinity, repeatType: "loop" }}
                      />
                      <motion.div 
                        className={`absolute w-1.5 h-1.5 rounded-full ${method.bgColor}/20`}
                        initial={{ top: "70%", right: "10%", opacity: 0 }}
                        animate={{ 
                          top: ["70%", "65%", "70%"],
                          right: ["10%", "15%", "10%"],
                          opacity: [0, 1, 0]
                        }}
                        transition={{ duration: 2.5, repeat: Infinity, repeatType: "loop" }}
                      />
                    </>
                  )}
                  
                  <motion.div 
                    className="flex items-center justify-center h-12 w-12 rounded-full shadow-sm mb-4"
                    style={{
                      background: `linear-gradient(to bottom right, white, ${getColorRGB(method.id, 0.1)})`
                    }}
                    variants={iconVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                  >
                    <span className={method.color}>{method.icon}</span>
                  </motion.div>
                  
                  <div className="space-y-2">
                    <h3 className={`text-gray-800 font-semibold transition-colors duration-300 ${hoveredMethod === method.id ? method.color : ''}`}>
                      {method.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{method.description}</p>
                  </div>
                  
                  <AnimatePresence>
                    {hoveredMethod === method.id && (
                      <motion.div 
                        className="absolute bottom-3 right-3"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ArrowRight className={`h-5 w-5 ${method.color}`} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* FIX: Using direct style prop for the accent line to ensure it works for all cards */}
                  <motion.div 
                    className="absolute left-0 top-0 bottom-0 w-1"
                    style={{ 
                      backgroundColor: getAccentColor(method.id),
                      transformOrigin: 'bottom',
                      scaleY: hoveredMethod === method.id ? 1 : 0
                    }}
                    animate={{ 
                      scaleY: hoveredMethod === method.id ? 1 : 0
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Payment Modals */}
      <UpiPaymentModal isOpen={activeModal === 'upi'} onClose={closeModal} />
      <BankTransferModal isOpen={activeModal === 'bank'} onClose={closeModal} />
      <InternationalPaymentModal isOpen={activeModal === 'international'} onClose={closeModal} />
    </>
  );
}

// Helper functions to get color values for dynamic styling
function getColorValues(id: string): string {
  switch (id) {
    case 'upi': return '79, 70, 229'; // indigo
    case 'bank': return '37, 99, 235'; // blue
    case 'mobile': return '16, 185, 129'; // emerald
    case 'international': return '217, 119, 6'; // amber
    default: return '79, 70, 229';
  }
}

function getColorRGB(id: string, alpha: number = 1): string {
  return `rgba(${getColorValues(id)}, ${alpha})`;
}

function getAccentColor(id: string): string {
  switch (id) {
    case 'upi': return '#6366f1'; // indigo-500
    case 'bank': return '#3b82f6'; // blue-500
    case 'mobile': return '#10b981'; // emerald-500
    case 'international': return '#f59e0b'; // amber-500
    default: return '#6366f1';
  }
}
