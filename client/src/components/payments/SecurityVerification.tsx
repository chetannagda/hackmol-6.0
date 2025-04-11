import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Lock, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SecurityVerificationProps {
  onVerificationComplete: (success: boolean) => void;
  action: string;
  includeBlockchain?: boolean;
  amount?: number;
  recipient?: string;
  highSecurity?: boolean;
}

interface CheckItem {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'complete' | 'failed';
  icon?: React.ReactNode;
}

export default function SecurityVerification({
  onVerificationComplete,
  action,
  includeBlockchain = true,
  amount,
  recipient,
  highSecurity = false,
}: SecurityVerificationProps) {
  const [checks, setChecks] = useState<CheckItem[]>([
    {
      id: 'fraud',
      label: 'Fraud Detection Analysis',
      status: 'pending',
      icon: <Shield className="h-4 w-4" />
    },
    {
      id: 'identity',
      label: 'Identity Verification',
      status: 'pending',
      icon: <Lock className="h-4 w-4" />
    },
    {
      id: 'risk',
      label: 'Risk Assessment',
      status: 'pending',
      icon: <AlertTriangle className="h-4 w-4" />
    }
  ]);
  
  const [verificationResult, setVerificationResult] = useState<'processing' | 'success' | 'failed'>('processing');
  const [showBlockchainMessage, setShowBlockchainMessage] = useState(false);
  
  // Simulate AI-based fraud detection
  useEffect(() => {
    // Max 5% chance of failure or higher if highSecurity is true
    const failureProbability = highSecurity ? 0.1 : 0.05;
    // If amount is very high, increase chance of fraud detection
    const amountFactor = amount && amount > 5000 ? 1.5 : 1;
    const willFail = Math.random() < (failureProbability * amountFactor);
    
    const processChecks = async () => {
      // Process first check - Fraud Detection
      setChecks(prev => prev.map(check => 
        check.id === 'fraud' ? { ...check, status: 'processing' } : check
      ));
      await new Promise(r => setTimeout(r, 700 + Math.random() * 1000));
      
      setChecks(prev => prev.map(check => 
        check.id === 'fraud' ? { 
          ...check, 
          status: willFail ? 'failed' : 'complete'
        } : check
      ));
      
      if (willFail) {
        setVerificationResult('failed');
        onVerificationComplete(false);
        return;
      }
      
      // Process second check - Identity Verification
      setChecks(prev => prev.map(check => 
        check.id === 'identity' ? { ...check, status: 'processing' } : check
      ));
      await new Promise(r => setTimeout(r, 600 + Math.random() * 800));
      
      setChecks(prev => prev.map(check => 
        check.id === 'identity' ? { ...check, status: 'complete' } : check
      ));
      
      // Process third check - Risk Assessment
      setChecks(prev => prev.map(check => 
        check.id === 'risk' ? { ...check, status: 'processing' } : check
      ));
      await new Promise(r => setTimeout(r, 500 + Math.random() * 700));
      
      setChecks(prev => prev.map(check => 
        check.id === 'risk' ? { ...check, status: 'complete' } : check
      ));
      
      // Add blockchain verification message if requested
      if (includeBlockchain) {
        setShowBlockchainMessage(true);
        await new Promise(r => setTimeout(r, 800));
      }
      
      setVerificationResult('success');
      onVerificationComplete(true);
    };
    
    processChecks();
  }, [action, onVerificationComplete, includeBlockchain, amount, highSecurity]);
  
  return (
    <div className="space-y-6 py-3">
      <div className="space-y-2 text-center">
        <h3 className="text-lg font-semibold">
          {verificationResult === 'processing' && 'Security Verification in Progress'}
          {verificationResult === 'success' && 'Verification Successful'}
          {verificationResult === 'failed' && 'Security Check Failed'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {verificationResult === 'processing' && 'AI-powered fraud detection analyzing transaction...'}
          {verificationResult === 'success' && 'Transaction verified and secured by blockchain technology'}
          {verificationResult === 'failed' && 'Potential security risk detected. Transaction canceled.'}
        </p>
      </div>
      
      <div className="space-y-4">
        {checks.map((check) => (
          <div key={check.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center",
                check.status === 'complete' && "bg-green-100 text-green-600",
                check.status === 'processing' && "bg-blue-100 text-blue-600",
                check.status === 'failed' && "bg-red-100 text-red-600",
                check.status === 'pending' && "bg-gray-100 text-gray-400"
              )}>
                {check.status === 'processing' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : check.status === 'complete' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : check.status === 'failed' ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  check.icon
                )}
              </div>
              <span className={cn(
                "text-sm font-medium",
                check.status === 'complete' && "text-green-600",
                check.status === 'processing' && "text-blue-600",
                check.status === 'failed' && "text-red-600"
              )}>
                {check.label}
              </span>
            </div>
            <span className={cn(
              "text-xs",
              check.status === 'complete' && "text-green-600",
              check.status === 'processing' && "text-blue-600",
              check.status === 'failed' && "text-red-600",
              check.status === 'pending' && "text-gray-400"
            )}>
              {check.status === 'complete' && 'Verified'}
              {check.status === 'processing' && 'Processing...'}
              {check.status === 'failed' && 'Alert'}
              {check.status === 'pending' && 'Pending'}
            </span>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-gray-600">Transfer Amount</div>
        <div className="font-semibold text-gray-900">₹{amount?.toFixed(2)}</div>
      </div>
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">Recipient Gets</div>
        <div className="font-semibold text-green-600">₹{amount?.toFixed(2)}</div>
      </div>

      {showBlockchainMessage && (
        <div className="mt-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-3 border border-blue-100">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Blockchain Security</span>
          </div>
          <p className="mt-1 text-xs text-blue-600">
            This transaction is being verified and secured through Ethereum blockchain technology, 
            ensuring maximum protection against unauthorized access and fraud with no additional fees.
          </p>
        </div>
      )}
      
      {verificationResult === 'failed' && (
        <div className="mt-6 rounded-lg bg-red-50 p-4 border border-red-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-sm font-semibold text-red-700">Transaction Canceled</span>
          </div>
          <p className="mt-1 text-xs text-red-600">
            This transaction has been automatically canceled and reversed due to potential security risks. 
            Your funds are safe and have not been deducted from your account.
          </p>
        </div>
      )}
      
      {verificationResult === 'success' && (
        <div className="mt-6 rounded-lg bg-green-50 p-4 border border-green-100">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-semibold text-green-700">Secured by Blockchain</span>
          </div>
          <p className="mt-1 text-xs text-green-600">
            Transaction verified in 1.2 seconds - superfast! Your payment is fully secured by 
            Ethereum blockchain technology, ensuring maximum protection with transparency and immutability.
          </p>
        </div>
      )}
    </div>
  );
}