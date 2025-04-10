import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";

interface SuccessModalProps {
  isOpen: boolean;
  transaction: any; // Transaction details
  onClose: () => void;
}

export default function SuccessModal({ isOpen, transaction, onClose }: SuccessModalProps) {
  if (!transaction) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 text-emerald-500 mb-6 mx-auto">
          <CheckIcon className="h-8 w-8" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Payment Successful!</h3>
        <p className="text-gray-600 mb-6">Your transaction has been processed successfully.</p>
        
        <div className="bg-gray-50 rounded-md p-4 text-left mb-6">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500">Transaction ID</p>
              <p className="text-sm font-medium">PSF{transaction.id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Date & Time</p>
              <p className="text-sm font-medium">{formatDateTime(transaction.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Amount</p>
              <p className="text-sm font-medium">
                {formatCurrency(transaction.amount, transaction.currency)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Payment Method</p>
              <p className="text-sm font-medium">{transaction.type}</p>
            </div>
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
          <Button className="flex-1" onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
