import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { generateVerificationCode } from "@/lib/utils";

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
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [code, setCode] = useState(verificationCode);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset timer when modal opens
      setTimeLeft(120);
      setCode(verificationCode);
      
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
  }, [isOpen, verificationCode, onClose]);

  const refreshCode = () => {
    setCode(generateVerificationCode());
    setTimeLeft(120); // Reset timer on refresh
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment Verification</DialogTitle>
        </DialogHeader>
        
        <div className="mb-6">
          <div className="countdown-timer">
            <div 
              className="countdown-progress absolute h-full bg-primary"
              style={{ width: `${percentLeft}%`, transition: 'width 1s linear' }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Session expires in <span id="countdown-timer">{formatTime()}</span>
          </p>
        </div>
        
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 mb-4">
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
          </div>
          <h4 className="text-lg font-medium text-gray-800 mb-2">Verification Code</h4>
          <p className="text-gray-600 mb-4">
            Share this code with the receiver to complete the transaction
          </p>
          
          <div className="flex justify-center">
            <div className="bg-gray-100 px-6 py-3 rounded-md">
              <span className="text-2xl font-bold text-gray-800 tracking-wider">{code}</span>
            </div>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 mb-6 space-y-1">
          <p>• Request sent to receiver to approve payment</p>
          <p>• Share this code with the receiver</p>
          <p>• Receiver must enter this code within 2 minutes</p>
        </div>
        
        <div className="flex space-x-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={refreshCode}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
