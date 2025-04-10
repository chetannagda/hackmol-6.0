import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, Loader2 } from "lucide-react";
import { generateVerificationCode } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface UpiVerificationModalProps {
  isOpen: boolean;
  verificationCode: string;
  onClose: () => void;
}

export default function UpiVerificationModal({ 
  isOpen, 
  verificationCode,
  onClose 
}: UpiVerificationModalProps) {
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [code, setCode] = useState(verificationCode);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "verifying" | "completed">("pending");

  useEffect(() => {
    if (isOpen) {
      // Reset timer and status when modal opens
      setTimeLeft(120);
      setCode(verificationCode);
      setVerificationStatus("pending");
      
      // Setup countdown timer
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // For demo purposes: Simulate verification after 3-4 seconds
      const simulateVerification = setTimeout(() => {
        setVerificationStatus("verifying");
        
        // Show "completed" status after 1.5 more seconds
        setTimeout(() => {
          setVerificationStatus("completed");
          
          // Show success toast
          toast({
            title: "Payment Verified",
            description: "The recipient has verified the payment. Processing transaction...",
            variant: "default"
          });
          
          // Close modal after showing completion for 2 seconds
          setTimeout(() => {
            onClose();
          }, 2000);
        }, 1500);
      }, 3000 + Math.random() * 1000); // Random time between 3-4 seconds
      
      return () => {
        clearInterval(timerRef.current!);
        clearTimeout(simulateVerification);
      };
    } else {
      // Clear timer when modal closes
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    
    // Clean up on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isOpen, verificationCode, onClose, toast]);

  const refreshCode = () => {
    // Only allow refresh if not already verifying/completed
    if (verificationStatus === "pending") {
      setCode(generateVerificationCode());
      setTimeLeft(120); // Reset timer on refresh
    }
  };

  // Format time as MM:SS
  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Calculate percentage of time remaining
  const percentLeft = (timeLeft / 120) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Only allow closing if not in the middle of verification
      if (!open && verificationStatus !== "verifying") {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment Verification</DialogTitle>
        </DialogHeader>
        
        <div className="mb-6">
          <p className="text-sm text-gray-600 mt-2">
            {verificationStatus === "completed" ? (
              <span className="text-green-600 font-medium">Verification Complete</span>
            ) : (
              <>Session expires in <span id="countdown-timer">{formatTime()}</span></>
            )}
          </p>
        </div>
        
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center h-16 w-16 rounded-full ${
            verificationStatus === "completed" 
              ? "bg-green-100 text-green-600" 
              : verificationStatus === "verifying"
                ? "bg-blue-100 text-blue-600"
                : "bg-primary-100 text-primary-600"
          } mb-4`}>
            {verificationStatus === "completed" ? (
              <CheckCircle className="h-8 w-8" />
            ) : verificationStatus === "verifying" ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
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
                className="h-8 w-8"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            )}
          </div>
          
          <h4 className="text-lg font-medium text-gray-800 mb-2">
            {verificationStatus === "completed" 
              ? "Payment Verified" 
              : verificationStatus === "verifying"
                ? "Verifying Payment"
                : "Verification Code"
            }
          </h4>
          
          {verificationStatus === "completed" ? (
            <p className="text-green-600 mb-4">
              The recipient has verified the payment successfully
            </p>
          ) : verificationStatus === "verifying" ? (
            <p className="text-gray-600 mb-4">
              The recipient is verifying the payment
            </p>
          ) : (
            <p className="text-gray-600 mb-4">
              Share this code with the receiver to complete the transaction
            </p>
          )}
          
          {verificationStatus !== "completed" && (
            <div className="flex justify-center">
              <div className="bg-gray-100 px-6 py-3 rounded-md">
                <span className="text-2xl font-bold text-gray-800 tracking-wider">{code}</span>
              </div>
            </div>
          )}
        </div>
        
        {verificationStatus === "pending" && (
          <div className="text-sm text-gray-600 mb-6 space-y-1">
            <p>• Request sent to receiver to approve payment</p>
            <p>• Share this code with the receiver</p>
            <p>• Receiver must enter this code within 2 minutes</p>
          </div>
        )}
        
        {verificationStatus === "verifying" && (
          <div className="text-sm text-gray-600 mb-6 space-y-1">
            <p>• Receiver is verifying the payment</p>
            <p>• Please wait while we process the transaction</p>
            <p>• This will only take a few seconds</p>
          </div>
        )}
        
        {verificationStatus === "completed" && (
          <div className="text-sm text-gray-600 mb-6 space-y-1">
            <p>• Payment has been verified by the recipient</p>
            <p>• Transaction is being recorded on blockchain</p>
            <p>• You'll receive a confirmation shortly</p>
          </div>
        )}
        
        <div className="flex space-x-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={verificationStatus === "verifying"}
          >
            {verificationStatus === "completed" ? "Close" : "Cancel"}
          </Button>
          
          {verificationStatus === "pending" && (
            <Button
              className="flex-1"
              onClick={refreshCode}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Code
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
