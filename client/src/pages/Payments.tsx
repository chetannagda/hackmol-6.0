import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smartphone, Building, Phone, Globe, Shield, Zap, Lock, ArrowRight, TrendingUp, RefreshCw } from "lucide-react";
import UpiPaymentModal from "@/components/payments/UpiPaymentModal";
import BankTransferModal from "@/components/payments/BankTransferModal";
import InternationalPaymentModal from "@/components/payments/InternationalPaymentModal";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

interface PaymentMethod {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tabId: string;
  color: string;
  gradient: string;
}

export default function Payments() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [hoveredMethod, setHoveredMethod] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const paymentMethods: PaymentMethod[] = [
    {
      id: "upi",
      title: "UPI Payment",
      description: "Pay directly via UPI ID",
      icon: <Smartphone className="h-5 w-5" />,
      tabId: "all",
      color: "indigo",
      gradient: "from-indigo-500 to-violet-600",
    },
    {
      id: "bank",
      title: "Bank Transfer",
      description: "Transfer to bank accounts",
      icon: <Building className="h-5 w-5" />,
      tabId: "all",
      color: "blue",
      gradient: "from-blue-500 to-cyan-600",
    },
    {
      id: "mobile",
      title: "Mobile Number",
      description: "Pay via registered mobile",
      icon: <Phone className="h-5 w-5" />,
      tabId: "all",
      color: "emerald",
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      id: "international",
      title: "International",
      description: "Send money abroad securely",
      icon: <Globe className="h-5 w-5" />,
      tabId: "all",
      color: "amber",
      gradient: "from-amber-500 to-orange-600",
    },
    {
      id: "upi",
      title: "UPI Payment",
      description: "Pay directly via UPI ID",
      icon: <Smartphone className="h-5 w-5" />,
      tabId: "domestic",
      color: "indigo",
      gradient: "from-indigo-500 to-violet-600",
    },
    {
      id: "bank",
      title: "Bank Transfer",
      description: "Transfer to bank accounts",
      icon: <Building className="h-5 w-5" />,
      tabId: "domestic",
      color: "blue",
      gradient: "from-blue-500 to-cyan-600",
    },
    {
      id: "mobile",
      title: "Mobile Number",
      description: "Pay via registered mobile",
      icon: <Phone className="h-5 w-5" />,
      tabId: "domestic",
      color: "emerald",
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      id: "international",
      title: "International",
      description: "Send money abroad securely",
      icon: <Globe className="h-5 w-5" />,
      tabId: "international",
      color: "amber",
      gradient: "from-amber-500 to-orange-600",
    },
  ];

  const handleMethodClick = (id: string) => {
    if (id === "mobile") {
      setActiveModal("upi");
    } else {
      setActiveModal(id);
    }
  };

  const closeModal = () => setActiveModal(null);

  const filteredMethods = paymentMethods.filter((method) => method.tabId === activeTab);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 200,
      },
    },
  };

  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div className="relative rounded-3xl overflow-hidden mb-12" variants={itemVariants}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-800"></div>
        <div className="absolute inset-0">
          <svg className="absolute inset-0 h-full w-full" width="100%" height="100%">
            <defs>
              <pattern id="dots-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="rgba(255, 255, 255, 0.1)" />
              </pattern>
              <linearGradient id="hero-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(79, 70, 229, 0.2)" />
                <stop offset="100%" stopColor="rgba(67, 56, 202, 0.1)" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#dots-pattern)" />
            <rect x="0" y="0" width="100%" height="100%" fill="url(#hero-gradient)" />
          </svg>
        </div>
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full bg-white/20 backdrop-blur-md"
            style={{
              width: Math.random() * 12 + 4,
              height: Math.random() * 12 + 4,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -Math.random() * 50 - 20, 0],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          />
        ))}
        <div className="relative z-10 py-16 px-8 md:px-12 flex flex-col md:flex-row items-center">
          <div className="md:w-3/5 mb-8 md:mb-0">
            <motion.h1
              className="text-3xl md:text-5xl font-bold text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <span className="block mb-2">Send Money</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white">
                Secured by Blockchain
              </span>
            </motion.h1>
            <motion.p
              className="text-blue-100 text-lg mb-8 max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Experience next-generation payments with unparalleled security, lightning-fast transactions, and the power
              of blockchain technology.
            </motion.p>
            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full py-2 px-4 text-white border border-white/20">
                <Shield className="h-4 w-4 mr-2" />
                <span>Bank-Grade Security</span>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full py-2 px-4 text-white border border-white/20">
                <Zap className="h-4 w-4 mr-2" />
                <span>Fast Transactions</span>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full py-2 px-4 text-white border border-white/20">
                <Lock className="h-4 w-4 mr-2" />
                <span>Fraud Protection</span>
              </div>
            </motion.div>
          </div>
          <motion.div
            className="md:w-2/5 flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 1, type: "spring" }}
          >
            <div className="relative w-64 h-64">
              <motion.div
                className="absolute inset-0 rounded-full bg-indigo-600/20 backdrop-blur-md"
                animate={{ scale: [1, 1.05, 1], opacity: [0.7, 0.9, 0.7] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute inset-10 rounded-full border-2 border-indigo-200/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-20 flex items-center justify-center"
                animate={{
                  rotate: [0, -10, 0, 10, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="h-24 w-24 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-500/30">
                  <Shield className="h-12 w-12 text-white" />
                </div>
              </motion.div>
              {["upi", "bank", "mobile", "international"].map((id, index) => {
                const method = paymentMethods.find((m) => m.id === id && m.tabId === "all");
                const angle = (index * 90 + (Date.now() / 100) % 360) % 360;
                const radius = 110;
                return (
                  <motion.div
                    key={`orbit-${id}`}
                    className="absolute h-12 w-12 rounded-full bg-white/90 shadow-md flex items-center justify-center"
                    style={{
                      top: `calc(50% + ${Math.sin((angle * Math.PI) / 180) * radius}px - 24px)`,
                      left: `calc(50% + ${Math.cos((angle * Math.PI) / 180) * radius}px - 24px)`,
                      boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.5)",
                    }}
                    animate={{
                      scale: [1, 1.1, 1],
                      boxShadow: [
                        "0 10px 25px -5px rgba(79, 70, 229, 0.3)",
                        "0 10px 25px -5px rgba(79, 70, 229, 0.6)",
                        "0 10px 25px -5px rgba(79, 70, 229, 0.3)",
                      ],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.5,
                    }}
                  >
                    <div className={`text-${method?.color}-600`}>{method?.icon}</div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </motion.div>
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-white rounded-xl p-1 shadow-md border border-indigo-100/40">
            {["all", "domestic", "international"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="capitalize py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300"
              >
                {tab === "all" ? "All Methods" : tab}
              </TabsTrigger>
            ))}
          </TabsList>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="all" className="mt-0">
                <Card className="border-0 shadow-xl bg-white rounded-xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 pb-6 relative">
                    <div className="absolute inset-0 overflow-hidden">
                      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="header-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="rgba(99, 102, 241, 0.1)" />
                            <stop offset="100%" stopColor="rgba(96, 165, 250, 0.05)" />
                          </linearGradient>
                        </defs>
                        <path d="M0,0 L100,0 L100,80 C60,100 40,70 0,100 L0,0 Z" fill="url(#header-gradient)" />
                      </svg>
                    </div>
                    <div className="relative z-10">
                      <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-700 to-blue-700 bg-clip-text text-transparent">
                        Payment Methods
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        Choose your preferred method to send money quickly and securely
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-8 pb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {paymentMethods
                        .filter((method) => method.tabId === "all")
                        .map((method, index) => (
                          <motion.div
                            key={`${method.id}-${index}`}
                            className="relative overflow-hidden rounded-xl cursor-pointer group"
                            whileHover={{ y: -5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            onClick={() => handleMethodClick(method.id)}
                            onMouseEnter={() => setHoveredMethod(`${method.id}-${index}`)}
                            onMouseLeave={() => setHoveredMethod(null)}
                          >
                            <div
                              className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${method.gradient}`}
                              style={{ opacity: 0.07 }}
                            />
                            <div
                              className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${method.gradient} transform origin-left transition-transform duration-300`}
                              style={{
                                transform: hoveredMethod === `${method.id}-${index}` ? "scaleX(1)" : "scaleX(0)",
                              }}
                            />
                            <div className="relative p-6 border border-gray-100 rounded-xl h-full flex flex-col group-hover:border-indigo-100 transition-colors duration-300 bg-white">
                              <div
                                className={`flex items-center justify-center h-14 w-14 rounded-xl bg-${method.color}-50 mb-5 group-hover:scale-110 transition-transform duration-300`}
                                style={{
                                  boxShadow:
                                    hoveredMethod === `${method.id}-${index}`
                                      ? `0 10px 15px -3px rgba(${getColorRGB(method.color)}, 0.2)`
                                      : "none",
                                }}
                              >
                                <div className={`text-${method.color}-600`}>{method.icon}</div>
                                {hoveredMethod === `${method.id}-${index}` && (
                                  <>
                                    <motion.div
                                      className={`absolute h-2 w-2 rounded-full bg-${method.color}-400`}
                                      initial={{ x: 0, y: 0, opacity: 0 }}
                                      animate={{
                                        x: [-10, 10, -5],
                                        y: [-10, -15, -5],
                                        opacity: [0, 1, 0],
                                      }}
                                      transition={{ duration: 1.5, ease: "easeOut" }}
                                    />
                                    <motion.div
                                      className={`absolute h-1.5 w-1.5 rounded-full bg-${method.color}-300`}
                                      initial={{ x: 0, y: 0, opacity: 0 }}
                                      animate={{
                                        x: [5, 15, 10],
                                        y: [-5, -10, 0],
                                        opacity: [0, 1, 0],
                                      }}
                                      transition={{ duration: 1.8, ease: "easeOut", delay: 0.2 }}
                                    />
                                  </>
                                )}
                              </div>
                              <h3
                                className={`text-gray-800 font-semibold mb-2 group-hover:text-${method.color}-700 transition-colors duration-300`}
                              >
                                {method.title}
                              </h3>
                              <p className="text-gray-600 text-sm flex-grow">{method.description}</p>
                              <motion.div
                                className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end"
                                initial={{ opacity: 0 }}
                                animate={{
                                  opacity: hoveredMethod === `${method.id}-${index}` ? 1 : 0,
                                }}
                                transition={{ duration: 0.2 }}
                              >
                                <span className={`text-sm font-medium text-${method.color}-600 mr-1`}>Select</span>
                                <ArrowRight className={`h-4 w-4 text-${method.color}-600`} />
                              </motion.div>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="domestic" className="mt-0">
                <Card className="border-0 shadow-xl bg-white rounded-xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 pb-6 relative">
                    <div className="absolute inset-0 overflow-hidden">
                      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="header-gradient-domestic" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="rgba(99, 102, 241, 0.1)" />
                            <stop offset="100%" stopColor="rgba(96, 165, 250, 0.05)" />
                          </linearGradient>
                        </defs>
                        <path d="M0,0 L100,0 L100,80 C60,100 40,70 0,100 L0,0 Z" fill="url(#header-gradient-domestic)" />
                      </svg>
                    </div>
                    <div className="relative z-10">
                      <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-700 to-blue-700 bg-clip-text text-transparent">
                        Domestic Payments
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        Fast and secure money transfers within India
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-8 pb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {paymentMethods
                        .filter((method) => method.tabId === "domestic")
                        .map((method, index) => (
                          <motion.div
                            key={`${method.id}-${index}-domestic`}
                            className="relative overflow-hidden rounded-xl cursor-pointer group"
                            whileHover={{ y: -5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            onClick={() => handleMethodClick(method.id)}
                            onMouseEnter={() => setHoveredMethod(`${method.id}-${index}-dom`)}
                            onMouseLeave={() => setHoveredMethod(null)}
                          >
                            <div
                              className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${method.gradient}`}
                              style={{ opacity: 0.07 }}
                            />
                            <div
                              className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${method.gradient} transform origin-left transition-transform duration-300`}
                              style={{
                                transform: hoveredMethod === `${method.id}-${index}-dom` ? "scaleX(1)" : "scaleX(0)",
                              }}
                            />
                            <div className="relative p-6 border border-gray-100 rounded-xl h-full flex flex-col group-hover:border-indigo-100 transition-colors duration-300 bg-white">
                              <div
                                className={`flex items-center justify-center h-14 w-14 rounded-xl bg-${method.color}-50 mb-5 group-hover:scale-110 transition-transform duration-300`}
                                style={{
                                  boxShadow:
                                    hoveredMethod === `${method.id}-${index}-dom`
                                      ? `0 10px 15px -3px rgba(${getColorRGB(method.color)}, 0.2)`
                                      : "none",
                                }}
                              >
                                <div className={`text-${method.color}-600`}>{method.icon}</div>
                              </div>
                              <h3
                                className={`text-gray-800 font-semibold mb-2 group-hover:text-${method.color}-700 transition-colors duration-300`}
                              >
                                {method.title}
                              </h3>
                              <p className="text-gray-600 text-sm flex-grow">{method.description}</p>
                              <motion.div
                                className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end"
                                initial={{ opacity: 0 }}
                                animate={{
                                  opacity: hoveredMethod === `${method.id}-${index}-dom` ? 1 : 0,
                                }}
                                transition={{ duration: 0.2 }}
                              >
                                <span className={`text-sm font-medium text-${method.color}-600 mr-1`}>Select</span>
                                <ArrowRight className={`h-4 w-4 text-${method.color}-600`} />
                              </motion.div>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="international" className="mt-0">
                <Card className="border-0 shadow-xl bg-white rounded-xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 pb-6 relative">
                    <div className="absolute inset-0 overflow-hidden">
                      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="header-gradient-international" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="rgba(245, 158, 11, 0.1)" />
                            <stop offset="100%" stopColor="rgba(234, 88, 12, 0.05)" />
                          </linearGradient>
                        </defs>
                        <path d="M0,0 L100,0 L100,80 C70,95 50,85 0,100 L0,0 Z" fill="url(#header-gradient-international)" />
                      </svg>
                    </div>
                    <div className="relative z-10">
                      <CardTitle className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        International Payments
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        Send money globally with blockchain security and low fees
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-8 pb-8">
                    <div className="grid grid-cols-1 gap-6">
                      {paymentMethods
                        .filter((method) => method.tabId === "international")
                        .map((method, index) => (
                          <motion.div
                            key={`${method.id}-${index}-international`}
                            className="relative overflow-hidden rounded-xl cursor-pointer group"
                            whileHover={{ y: -5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            onClick={() => handleMethodClick(method.id)}
                            onMouseEnter={() => setHoveredMethod(`${method.id}-int`)}
                            onMouseLeave={() => setHoveredMethod(null)}
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/10 z-0" />
                            <div
                              className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 transform origin-left transition-transform duration-300"
                              style={{
                                transform: hoveredMethod === `${method.id}-int` ? "scaleX(1)" : "scaleX(0)",
                              }}
                            />
                            <div className="relative z-10 p-6 border border-amber-100 rounded-xl bg-white">
                              <div className="flex flex-col md:flex-row md:items-center gap-6">
                                <div className="flex-shrink-0">
                                  <div
                                    className={`flex items-center justify-center h-16 w-16 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100`}
                                    style={{
                                      boxShadow:
                                        hoveredMethod === `${method.id}-int`
                                          ? "0 15px 30px -10px rgba(245, 158, 11, 0.3)"
                                          : "none",
                                      transform: hoveredMethod === `${method.id}-int` ? "scale(1.05)" : "scale(1)",
                                      transition: "transform 0.3s, box-shadow 0.3s",
                                    }}
                                  >
                                    <div className="text-amber-600">{method.icon}</div>
                                  </div>
                                </div>
                                <div className="flex-grow">
                                  <h3 className="text-gray-800 font-semibold mb-2 text-lg">{method.title}</h3>
                                  <p className="text-gray-600">{method.description}</p>
                                  <div className="mt-4 pt-4 border-t border-gray-200">
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                                      Benefits of Blockchain Payments:
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="flex items-start space-x-2">
                                        <Shield className="h-5 w-5 text-amber-500 mt-0.5" />
                                        <div>
                                          <p className="font-medium text-gray-800">Secure & Transparent</p>
                                          <p className="text-sm text-gray-600">
                                            Every transaction is cryptographically secured
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-start space-x-2">
                                        <TrendingUp className="h-5 w-5 text-amber-500 mt-0.5" />
                                        <div>
                                          <p className="font-medium text-gray-800">Low Fees</p>
                                          <p className="text-sm text-gray-600">
                                            Up to 90% cheaper than traditional banks
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-start space-x-2">
                                        <Zap className="h-5 w-5 text-amber-500 mt-0.5" />
                                        <div>
                                          <p className="font-medium text-gray-800">Fast Settlement</p>
                                          <p className="text-sm text-gray-600">
                                            Minutes instead of days for transfers
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-start space-x-2">
                                        <RefreshCw className="h-5 w-5 text-amber-500 mt-0.5" />
                                        <div>
                                          <p className="font-medium text-gray-800">No Intermediaries</p>
                                          <p className="text-sm text-gray-600">
                                            Direct transfers without third parties
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex-shrink-0">
                                  <motion.button
                                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg font-medium flex items-center shadow-lg shadow-amber-200/50"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    Start Transfer
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                  </motion.button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </motion.div>
      <motion.div className="mt-12" variants={itemVariants}>
        <Card className="border-0 shadow-xl bg-white rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 pb-6 relative">
            <div className="absolute inset-0 overflow-hidden">
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="header-gradient-features" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(99, 102, 241, 0.1)" />
                    <stop offset="100%" stopColor="rgba(96, 165, 250, 0.05)" />
                  </linearGradient>
                </defs>
                <path d="M0,0 L100,0 L100,80 C60,95 30,90 0,100 L0,0 Z" fill="url(#header-gradient-features)" />
              </svg>
            </div>
            <div className="relative z-10">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-700 to-blue-700 bg-clip-text text-transparent">
                Payment Security Features
              </CardTitle>
              <CardDescription className="text-gray-600">
                Industry-leading security measures to protect your transactions
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-8 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                className="relative overflow-hidden rounded-xl"
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 opacity-50"></div>
                <div className="absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 rounded-full"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-indigo-500/10 to-indigo-500/0 rounded-full"></div>
                <div className="relative p-6 bg-white/90 backdrop-blur-sm rounded-xl border border-indigo-100 h-full">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white mb-5 rotate-3 shadow-lg shadow-indigo-200/50">
                    <Shield className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">AI Fraud Detection</h3>
                  <p className="text-gray-600">
                    Our AI-powered fraud detection system analyzes each transaction in real-time to identify suspicious
                    patterns and prevent fraudulent activities.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-center text-sm text-gray-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mr-2"></span>
                      Behavioral analytics
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mr-2"></span>
                      Pattern recognition
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mr-2"></span>
                      Real-time monitoring
                    </li>
                  </ul>
                </div>
              </motion.div>
              <motion.div
                className="relative overflow-hidden rounded-xl"
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-500/5 opacity-50"></div>
                <div className="absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-full"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-blue-500/0 rounded-full"></div>
                <div className="relative p-6 bg-white/90 backdrop-blur-sm rounded-xl border border-blue-100 h-full">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white mb-5 -rotate-3 shadow-lg shadow-blue-200/50">
                    <Lock className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Secure Verification</h3>
                  <p className="text-gray-600">
                    Our multi-level verification system ensures that high-value transactions are properly authorized and
                    protected against unauthorized access.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-center text-sm text-gray-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-2"></span>
                      Two-factor authentication
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-2"></span>
                      Biometric verification
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-2"></span>
                      Encrypted communication
                    </li>
                  </ul>
                </div>
              </motion.div>
              <motion.div
                className="relative overflow-hidden rounded-xl"
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 opacity-50"></div>
                <div className="absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-full"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-emerald-500/10 to-emerald-500/0 rounded-full"></div>
                <div className="relative p-6 bg-white/90 backdrop-blur-sm rounded-xl border border-emerald-100 h-full">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white mb-5 rotate-3 shadow-lg shadow-emerald-200/50">
                    <Globe className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Blockchain Technology</h3>
                  <p className="text-gray-600">
                    Our blockchain-based payment system provides unmatched security and transparency for international
                    transfers with lower fees.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-center text-sm text-gray-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2"></span>
                      Immutable transaction records
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2"></span>
                      Decentralized verification
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2"></span>
                      Cryptographic security
                    </li>
                  </ul>
                </div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      <UpiPaymentModal isOpen={activeModal === "upi"} onClose={closeModal} />
      <BankTransferModal isOpen={activeModal === "bank"} onClose={closeModal} />
      <InternationalPaymentModal isOpen={activeModal === "international"} onClose={closeModal} />
    </motion.div>
  );
}

function getColorRGB(color: string): string {
  switch (color) {
    case "indigo":
      return "99, 102, 241";
    case "blue":
      return "59, 130, 246";
    case "emerald":
      return "16, 185, 129";
    case "amber":
      return "245, 158, 11";
    default:
      return "99, 102, 241";
  }
}
