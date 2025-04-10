import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckIcon, Shield, Zap, Clock, LockKeyhole } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { truncateAddress } from "@/lib/utils";

interface SuccessModalProps {
  isOpen: boolean;
  transaction: any; // Transaction details
  onClose: () => void;
}

export default function SuccessModal({ isOpen, transaction, onClose }: SuccessModalProps) {
  if (!transaction) {
    return null;
  }

  // Generate fake blockchain transaction hash
  const blockchainHash = "0x" + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 30);
  
  // Calculate a random transaction fee (slightly less than original amount)
  const feePercentage = Math.random() * 0.015 + 0.005; // 0.5% to 2%
  const transactionFee = transaction.amount * feePercentage;
  const finalAmount = transaction.amount - transactionFee;
  
  // Show processing time in milliseconds (600-1500ms range)
  const processingTime = Math.floor(Math.random() * 900) + 600;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white mb-6 mx-auto">
            <CheckIcon className="h-8 w-8" />
          </div>
          
          <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Payment Successful!</h3>
          <div className="flex justify-center items-center gap-2 mb-6">
            <Zap className="h-4 w-4 text-amber-500" />
            <p className="text-sm text-gray-600">
              Completed in <span className="font-medium">{processingTime}ms</span> - superfast!
            </p>
          </div>
        </div>
        
        {/* Transaction Details Card */}
        <div className="bg-gray-50 rounded-lg p-4 text-left mb-4 border border-gray-100">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Transaction ID</p>
              <p className="text-sm font-medium">PSF{transaction.id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Date & Time</p>
              <p className="text-sm font-medium">{formatDateTime(transaction.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Amount Sent</p>
              <p className="text-sm font-medium">
                {formatCurrency(transaction.amount, transaction.currency)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Payment Method</p>
              <p className="text-sm font-medium">{transaction.type}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Network Fee</p>
              <p className="text-sm font-medium text-amber-600">
                {formatCurrency(transactionFee, transaction.currency)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Final Amount Received</p>
              <p className="text-sm font-medium text-emerald-600">
                {formatCurrency(finalAmount, transaction.currency)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Blockchain Security Badge */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 mb-6 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-blue-600" />
            <h4 className="text-sm font-medium text-blue-700">Blockchain Verified & Secured</h4>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-3 w-3 text-blue-500" />
            <p className="text-xs text-blue-600">
              Blockchain confirmation in 1 block (~12 seconds)
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <LockKeyhole className="h-3 w-3 text-blue-500" />
            <p className="text-xs text-blue-600 font-mono">
              {truncateAddress(blockchainHash, 8)}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              // Navigate to transaction details - for now, just close
              onClose();
            }}
          >
            View Details
          </Button>
          <Button className="flex-1 bg-gradient-to-r from-primary to-primary/80" onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
