import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function truncateAddress(address: string, chars: number = 4): string {
  if (!address) return "";
  const start = address.substring(0, chars + 2);
  const end = address.substring(address.length - chars);
  return `${start}...${end}`;
}

export function formatDate(date: Date | number | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | number | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function generateVerificationCode(): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "PSFV-";
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function detectFraud(amount: number, paymentType: string, userHistory: any[]): { 
  isFraud: boolean; 
  reason?: string;
} {
  console.log(`Running fraud detection for ${paymentType} payment of ${amount}`);
  
  // Check for unusually large amount
  if (amount > 100000) {
    console.log("Fraud detection: Unusually large amount");
    return { isFraud: true, reason: "Unusually large amount" };
  }
  
  // Check for multiple rapid transactions (simulation)
  const recentTransactions = userHistory.filter(
    (tx) => new Date(tx.timestamp).getTime() > Date.now() - 15 * 60 * 1000
  );
  
  if (recentTransactions.length > 5) {
    console.log("Fraud detection: Too many transactions in a short period");
    return { isFraud: true, reason: "Too many transactions in a short period" };
  }
  
  // International payments extra scrutiny
  if (paymentType === "INTERNATIONAL" && amount > 50000) {
    console.log("Fraud detection: Large international payment requires additional verification");
    return { isFraud: true, reason: "Large international payment requires additional verification" };
  }
  
  console.log("Fraud detection: No fraud detected");
  return { isFraud: false };
}

export function detectImpulsiveSpending(amount: number, userHistory: any[]): {
  isImpulsive: boolean;
  reason?: string;
} {
  console.log("Running AI pattern detection for impulsive spending");
  
  // Check if this category has multiple purchases recently
  const categories = userHistory
    .filter((tx) => tx.type === "purchase")
    .map((tx) => tx.category);
  
  const categoryCounts: Record<string, number> = {};
  categories.forEach((category) => {
    if (category) {
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    }
  });
  
  const highFrequencyCategories = Object.entries(categoryCounts)
    .filter(([_, count]) => count > 3)
    .map(([category]) => category);
  
  if (highFrequencyCategories.length > 0) {
    console.log(`Pattern detection: Multiple recent purchases in ${highFrequencyCategories.join(", ")}`);
    return { 
      isImpulsive: true, 
      reason: "Pattern of frequent similar purchases detected" 
    };
  }
  
  // Check if amount is higher than user's average transaction
  const averageSpend = userHistory.length > 0
    ? userHistory.reduce((sum, tx) => sum + tx.amount, 0) / userHistory.length
    : 0;
  
  if (amount > averageSpend * 2) {
    console.log(`Pattern detection: Amount ${amount} is much higher than average spend ${averageSpend}`);
    return { 
      isImpulsive: true, 
      reason: "Amount is significantly higher than your average spending" 
    };
  }
  
  console.log("Pattern detection: No impulsive spending detected");
  return { isImpulsive: false };
}
