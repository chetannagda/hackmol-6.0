import React, { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useNotifications } from '@/context/NotificationsContext';
import { Bell, CheckCircle, Key, AlertTriangle, ExternalLink, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { verifyPaymentCode } from '@/lib/firebase';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Notification item component
const NotificationItem = ({ notification, onVerify }: { 
  notification: any, 
  onVerify: (notification: any) => void 
}) => {
  const { markAsRead } = useNotifications();
  
  const handleClick = () => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // If it's a payment request, open the verification dialog
    if (notification.type === 'PAYMENT_REQUEST') {
      onVerify(notification);
    }
  };
  
  // Icon based on notification type
  const renderIcon = () => {
    switch (notification.type) {
      case 'PAYMENT_REQUEST':
        return <Key className="h-5 w-5 text-blue-500" />;
      case 'PAYMENT_VERIFIED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'PAYMENT_FAILED':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };
  
  return (
    <div 
      onClick={handleClick}
      className={`
        p-3 border-b last:border-b-0 cursor-pointer transition-colors
        ${notification.isRead ? 'bg-white' : 'bg-blue-50'}
        hover:bg-gray-50
      `}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0">
          {renderIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium text-sm ${notification.isRead ? 'text-gray-800' : 'text-gray-900'}`}>
            {notification.title}
          </h4>
          <p className="text-xs text-gray-600 mt-0.5 truncate">
            {notification.message}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Payment verification dialog
const PaymentVerificationDialog = ({ 
  isOpen, 
  onClose, 
  notification 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  notification: any | null 
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();
  
  const formSchema = z.object({
    verificationCode: z.string().length(6, "Verification code must be 6 digits"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      verificationCode: notification?.verificationCode || "",
    },
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!auth.currentUser) return;
    
    setIsVerifying(true);
    try {
      const result = await verifyPaymentCode(values.verificationCode, auth.currentUser.uid);
      
      if (result.success) {
        toast({
          title: "Payment Verified",
          description: "The payment has been successfully verified",
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
        });
        onClose();
      } else {
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: result.message,
          icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
        });
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: "An unexpected error occurred",
        icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
      });
    } finally {
      setIsVerifying(false);
    }
  };
  
  if (!notification) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Payment Verification
          </DialogTitle>
          <DialogDescription>
            Enter the 6-digit verification code to verify the payment.
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-2 p-3 bg-blue-50 rounded-md border border-blue-100">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Amount:</span> ₹{notification.amount?.toFixed(2) || "N/A"}
          </p>
          <p className="text-sm text-blue-700">
            <span className="font-medium">Method:</span> {notification.paymentType || "N/A"}
          </p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="verificationCode"
              render={({ field }) => (
                <FormItem className="mx-auto max-w-xs">
                  <FormLabel className="text-center block">Verification Code</FormLabel>
                  <FormControl>
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isVerifying}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isVerifying}
              >
                {isVerifying ? "Verifying..." : "Verify Payment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// Main notification dropdown component
export default function NotificationDropdown() {
  const { notifications, unreadCount, loading } = useNotifications();
  const [showVerification, setShowVerification] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  
  const handleVerify = (notification: any) => {
    setSelectedNotification(notification);
    setShowVerification(true);
  };
  
  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-gray-800">Notifications</h3>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                {unreadCount} unread
              </span>
            </div>
          </div>
          
          <ScrollArea className="h-80">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center h-32 p-4">
                <Bell className="h-6 w-6 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification}
                  onVerify={handleVerify}
                />
              ))
            )}
          </ScrollArea>
          
          <div className="p-2 border-t border-gray-200 bg-gray-50">
            <Button variant="ghost" size="sm" className="w-full text-xs">
              <ExternalLink className="h-3.5 w-3.5 mr-1" />
              View all notifications
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      
      <PaymentVerificationDialog 
        isOpen={showVerification}
        onClose={() => setShowVerification(false)}
        notification={selectedNotification}
      />
    </>
  );
}