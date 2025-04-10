import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  loginSchema, 
  registerSchema, 
  upiPaymentSchema, 
  bankTransferSchema, 
  internationalPaymentSchema
} from "@shared/schema";
import crypto from "crypto";

function generateVerificationCode() {
  return `PSFV-${crypto.randomInt(1000, 9999)}`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();
  
  // User registration
  apiRouter.post("/register", async (req: Request, res: Response) => {
    try {
      const parsedData = registerSchema.safeParse(req.body);
      
      if (!parsedData.success) {
        return res.status(400).json({ 
          message: "Invalid input data", 
          errors: parsedData.error.errors 
        });
      }
      
      const { confirmPassword, agreeToTerms, ...userData } = parsedData.data;
      
      // Check if email already exists
      const existingUserByEmail = await storage.getUserByEmail(userData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      // Check if username already exists
      const existingUserByUsername = await storage.getUserByUsername(userData.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already in use" });
      }
      
      const user = await storage.createUser(userData);
      
      // Don't send password back in response
      const { password, ...userResponse } = user;
      
      res.status(201).json({ 
        message: "User registered successfully", 
        user: userResponse 
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // User login
  apiRouter.post("/login", async (req: Request, res: Response) => {
    try {
      const parsedData = loginSchema.safeParse(req.body);
      
      if (!parsedData.success) {
        return res.status(400).json({ 
          message: "Invalid input data", 
          errors: parsedData.error.errors 
        });
      }
      
      const { email, password } = parsedData.data;
      
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Don't send password back in response
      const { password: _, ...userResponse } = user;
      
      res.json({ 
        message: "Login successful", 
        user: userResponse 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get user profile
  apiRouter.get("/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send password back in response
      const { password, ...userResponse } = user;
      
      res.json({ user: userResponse });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get user's transactions
  apiRouter.get("/users/:id/transactions", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const transactions = await storage.getTransactionsByUserId(userId);
      
      res.json({ transactions });
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get user's recent transactions
  apiRouter.get("/users/:id/recent-transactions", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const limit = parseInt(req.query.limit as string) || 5;
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const transactions = await storage.getRecentTransactionsByUserId(userId, limit);
      
      res.json({ transactions });
    } catch (error) {
      console.error("Get recent transactions error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get user's monthly stats
  apiRouter.get("/users/:id/monthly-stats", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const stats = await storage.getMonthlyStats(userId);
      
      res.json({ stats });
    } catch (error) {
      console.error("Get monthly stats error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Create UPI payment
  apiRouter.post("/payments/upi", async (req: Request, res: Response) => {
    try {
      const parsedData = upiPaymentSchema.safeParse(req.body);
      
      if (!parsedData.success) {
        return res.status(400).json({ 
          message: "Invalid input data", 
          errors: parsedData.error.errors 
        });
      }
      
      const { upiId, amount, note, pin } = parsedData.data;
      const senderId = req.body.senderId;
      
      if (!senderId) {
        return res.status(400).json({ message: "Sender ID is required" });
      }
      
      // Validate sender exists
      const sender = await storage.getUser(senderId);
      if (!sender) {
        return res.status(404).json({ message: "Sender not found" });
      }
      
      // Check if sender has enough balance
      if (sender.walletBalance < amount) {
        return res.status(400).json({ message: "Insufficient funds" });
      }
      
      // Simulate fraud detection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For amounts over 2000, generate verification code and set to PENDING
      const status = amount > 2000 ? "PENDING" : "COMPLETED";
      const verificationCode = amount > 2000 ? generateVerificationCode() : null;
      
      // Create transaction
      const transaction = await storage.createTransaction({
        senderId,
        receiverId: null,
        receiverUpiId: upiId,
        receiverAccountNumber: null,
        receiverIfscCode: null,
        receiverEthAddress: null,
        amount,
        currency: "INR",
        type: "UPI",
        status,
        note: note || null,
        verificationCode
      });
      
      // If completed immediately, update sender's balance
      if (status === "COMPLETED") {
        await storage.updateUser(senderId, {
          walletBalance: sender.walletBalance - amount
        });
      }
      
      res.status(201).json({ 
        message: "UPI payment " + (status === "COMPLETED" ? "completed" : "initiated"), 
        transaction,
        verificationRequired: status === "PENDING"
      });
    } catch (error) {
      console.error("UPI payment error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Verify UPI payment
  apiRouter.post("/payments/upi/verify", async (req: Request, res: Response) => {
    try {
      const { transactionId, verificationCode } = req.body;
      
      if (!transactionId || !verificationCode) {
        return res.status(400).json({ message: "Transaction ID and verification code are required" });
      }
      
      const transaction = await storage.getTransaction(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      if (transaction.status !== "PENDING") {
        return res.status(400).json({ message: "Transaction is not pending verification" });
      }
      
      if (transaction.verificationCode !== verificationCode) {
        return res.status(400).json({ message: "Invalid verification code" });
      }
      
      // Get sender to update balance
      const sender = await storage.getUser(transaction.senderId);
      if (!sender) {
        return res.status(404).json({ message: "Sender not found" });
      }
      
      // Update transaction status
      const updatedTransaction = await storage.updateTransaction(transactionId, {
        status: "COMPLETED"
      });
      
      // Update sender's balance
      await storage.updateUser(transaction.senderId, {
        walletBalance: sender.walletBalance - transaction.amount
      });
      
      res.json({ 
        message: "Payment verified successfully", 
        transaction: updatedTransaction 
      });
    } catch (error) {
      console.error("Verify UPI payment error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Create bank transfer
  apiRouter.post("/payments/bank", async (req: Request, res: Response) => {
    try {
      const parsedData = bankTransferSchema.safeParse(req.body);
      
      if (!parsedData.success) {
        return res.status(400).json({ 
          message: "Invalid input data", 
          errors: parsedData.error.errors 
        });
      }
      
      const { beneficiaryName, accountNumber, ifscCode, amount, note } = parsedData.data;
      const senderId = req.body.senderId;
      
      if (!senderId) {
        return res.status(400).json({ message: "Sender ID is required" });
      }
      
      // Validate sender exists
      const sender = await storage.getUser(senderId);
      if (!sender) {
        return res.status(404).json({ message: "Sender not found" });
      }
      
      // Check if sender has enough balance
      if (sender.walletBalance < amount) {
        return res.status(400).json({ message: "Insufficient funds" });
      }
      
      // Simulate fraud detection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Bank transfers are pending until accepted
      const transaction = await storage.createTransaction({
        senderId,
        receiverId: null,
        receiverUpiId: null,
        receiverAccountNumber: accountNumber,
        receiverIfscCode: ifscCode,
        receiverEthAddress: null,
        amount,
        currency: "INR",
        type: "BANK",
        status: "PENDING",
        note: note || null,
        verificationCode: null
      });
      
      res.status(201).json({ 
        message: "Bank transfer initiated", 
        transaction
      });
    } catch (error) {
      console.error("Bank transfer error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Complete bank transfer
  apiRouter.post("/payments/bank/complete", async (req: Request, res: Response) => {
    try {
      const { transactionId } = req.body;
      
      if (!transactionId) {
        return res.status(400).json({ message: "Transaction ID is required" });
      }
      
      const transaction = await storage.getTransaction(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      if (transaction.status !== "PENDING") {
        return res.status(400).json({ message: "Transaction is not pending" });
      }
      
      // Get sender to update balance
      const sender = await storage.getUser(transaction.senderId);
      if (!sender) {
        return res.status(404).json({ message: "Sender not found" });
      }
      
      // Update transaction status
      const updatedTransaction = await storage.updateTransaction(transactionId, {
        status: "COMPLETED"
      });
      
      // Update sender's balance
      await storage.updateUser(transaction.senderId, {
        walletBalance: sender.walletBalance - transaction.amount
      });
      
      res.json({ 
        message: "Bank transfer completed successfully", 
        transaction: updatedTransaction 
      });
    } catch (error) {
      console.error("Complete bank transfer error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Create international payment
  apiRouter.post("/payments/international", async (req: Request, res: Response) => {
    try {
      const parsedData = internationalPaymentSchema.safeParse(req.body);
      
      if (!parsedData.success) {
        return res.status(400).json({ 
          message: "Invalid input data", 
          errors: parsedData.error.errors 
        });
      }
      
      const { walletAddress, amount, currency } = parsedData.data;
      const senderId = req.body.senderId;
      
      if (!senderId) {
        return res.status(400).json({ message: "Sender ID is required" });
      }
      
      // Validate sender exists
      const sender = await storage.getUser(senderId);
      if (!sender) {
        return res.status(404).json({ message: "Sender not found" });
      }
      
      // Check if sender has enough balance
      if (sender.walletBalance < amount) {
        return res.status(400).json({ message: "Insufficient funds" });
      }
      
      // Simulate fraud detection and blockchain process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Create transaction (international payments complete immediately)
      const transaction = await storage.createTransaction({
        senderId,
        receiverId: null,
        receiverUpiId: null,
        receiverAccountNumber: null,
        receiverIfscCode: null,
        receiverEthAddress: walletAddress,
        amount,
        currency,
        type: "INTERNATIONAL",
        status: "COMPLETED",
        note: null,
        verificationCode: null
      });
      
      // Update sender's balance
      await storage.updateUser(senderId, {
        walletBalance: sender.walletBalance - amount
      });
      
      res.status(201).json({ 
        message: "International payment completed", 
        transaction
      });
    } catch (error) {
      console.error("International payment error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Add funds to wallet
  apiRouter.post("/users/:id/add-funds", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const { amount } = req.body;
      
      if (isNaN(userId) || !amount || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ message: "Invalid user ID or amount" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUser(userId, {
        walletBalance: user.walletBalance + amount
      });
      
      // Don't send password back in response
      const { password, ...userResponse } = updatedUser!;
      
      res.json({ 
        message: "Funds added successfully", 
        user: userResponse 
      });
    } catch (error) {
      console.error("Add funds error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Use the API router with the /api prefix
  app.use("/api", apiRouter);
  
  const httpServer = createServer(app);
  
  return httpServer;
}
