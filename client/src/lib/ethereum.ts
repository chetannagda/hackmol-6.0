import { ethers } from "ethers";

// Ethereum utility functions
export const getEthereumProvider = () => {
  // Use a fallback provider if window.ethereum is not available
  try {
    if (window.ethereum) {
      console.log("Using window.ethereum provider");
      return new ethers.BrowserProvider(window.ethereum);
    } else {
      console.log("Using Infura fallback provider");
      return new ethers.JsonRpcProvider(
        `https://mainnet.infura.io/v3/${import.meta.env.VITE_INFURA_API_KEY || "fallback-key"}`
      );
    }
  } catch (error) {
    console.error("Error creating Ethereum provider:", error);
    return null;
  }
};

export const getWalletAddress = async () => {
  try {
    const provider = getEthereumProvider();
    if (!provider) return null;
    
    // Request account access if needed
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      return accounts[0];
    }
    return null;
  } catch (error) {
    console.error("Error getting wallet address:", error);
    return null;
  }
};

export const getEthBalance = async (address: string) => {
  try {
    const provider = getEthereumProvider();
    if (!provider || !address) return null;
    
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error("Error getting ETH balance:", error);
    return null;
  }
};

export const sendEthereum = async (
  fromAddress: string,
  toAddress: string,
  amount: string
) => {
  try {
    if (!window.ethereum) {
      throw new Error("Ethereum provider not available");
    }
    
    console.log(`Preparing to send ${amount} ETH from ${fromAddress} to ${toAddress}`);
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Convert amount to wei
    const amountWei = ethers.parseEther(amount);
    
    // Verify sender has enough balance
    const balance = await provider.getBalance(fromAddress);
    if (balance < amountWei) {
      throw new Error("Insufficient funds for gas * price + value");
    }
    
    console.log("Sending Ethereum transaction to blockchain");
    
    // Send transaction
    const tx = await signer.sendTransaction({
      to: toAddress,
      value: amountWei,
    });
    
    console.log("Transaction sent, waiting for confirmation");
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    console.log("Transaction confirmed with hash:", receipt?.hash);
    
    return {
      success: true,
      transactionHash: receipt?.hash,
      blockNumber: receipt?.blockNumber,
    };
  } catch (error) {
    console.error("Error sending Ethereum:", error);
    throw error;
  }
};

export const convertCurrency = async (
  amount: number,
  fromCurrency: string,
  toCurrency: string = "ETH"
) => {
  try {
    console.log(`Converting ${amount} ${fromCurrency} to ${toCurrency}`);
    
    // Simulate API call to get exchange rate
    // In a real app, you would call an actual exchange rate API
    const exchangeRates: Record<string, number> = {
      INR: 0.000006, // 1 INR = 0.000006 ETH
      USD: 0.00042,  // 1 USD = 0.00042 ETH
      EUR: 0.00045,  // 1 EUR = 0.00045 ETH
      GBP: 0.00052,  // 1 GBP = 0.00052 ETH
    };
    
    if (!exchangeRates[fromCurrency]) {
      throw new Error(`Unsupported currency: ${fromCurrency}`);
    }
    
    const ethAmount = amount * exchangeRates[fromCurrency];
    
    console.log(`Converted amount: ${ethAmount} ETH`);
    
    // Get the conversion rate in reverse for display
    const rate = 1 / exchangeRates[fromCurrency];
    
    return {
      fromAmount: amount,
      fromCurrency,
      toAmount: ethAmount,
      toCurrency,
      rate,
      fee: amount * 0.01, // 1% fee
    };
  } catch (error) {
    console.error("Error converting currency:", error);
    throw error;
  }
};

export const estimateGas = async (toAddress: string, amount: string) => {
  try {
    const provider = getEthereumProvider();
    if (!provider) throw new Error("Ethereum provider not available");
    
    // Estimate gas
    const gasEstimate = await provider.estimateGas({
      to: toAddress,
      value: ethers.parseEther(amount),
    });
    
    // Get gas price
    const gasPrice = await provider.getFeeData();
    
    // Calculate gas cost
    const gasCost = gasEstimate * (gasPrice.gasPrice || ethers.parseUnits("20", "gwei"));
    
    // For demo purposes, return a simplified gas estimate
    return ethers.formatUnits(gasPrice.gasPrice || ethers.parseUnits("20", "gwei"), "gwei");
  } catch (error) {
    console.error("Error estimating gas:", error);
    // Return a reasonable gas estimate for simulation
    return "25";
  }
};

// Define interface for Ethereum globals
declare global {
  interface Window {
    ethereum: any;
  }
}
