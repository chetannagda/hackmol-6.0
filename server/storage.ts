import { 
  users, 
  transactions, 
  type User, 
  type InsertUser, 
  type Transaction, 
  type InsertTransaction 
} from "@shared/schema";
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;

  // Transaction methods
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, data: Partial<Transaction>): Promise<Transaction | undefined>;
  getRecentTransactionsByUserId(userId: number, limit: number): Promise<Transaction[]>;
  getMonthlyStats(userId: number): Promise<{ spent: number, received: number }>;
}

interface StorageData {
  users: Record<number, User>;
  transactions: Record<number, Transaction>;
  currentUserId: number;
  currentTransactionId: number;
}

export class FileStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private currentUserId: number;
  private currentTransactionId: number;
  private storageFilePath: string;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.currentUserId = 1;
    this.currentTransactionId = 1;
    
    // Create a storage file path in the project directory
    this.storageFilePath = path.join(__dirname, '../storage-data.json');
    
    // Load data from file if it exists
    this.loadDataFromFile();
  }

  private loadDataFromFile(): void {
    try {
      if (fs.existsSync(this.storageFilePath)) {
        const data = fs.readFileSync(this.storageFilePath, 'utf-8');
        const storageData: StorageData = JSON.parse(data, (key, value) => {
          // Convert string dates back to Date objects
          if (key === 'createdAt' || key === 'updatedAt') {
            return new Date(value);
          }
          return value;
        });

        // Load users
        this.users = new Map(
          Object.entries(storageData.users).map(([id, user]) => [Number(id), user])
        );
        
        // Load transactions
        this.transactions = new Map(
          Object.entries(storageData.transactions).map(([id, transaction]) => [Number(id), transaction])
        );
        
        this.currentUserId = storageData.currentUserId;
        this.currentTransactionId = storageData.currentTransactionId;
        
        console.log(`Loaded ${this.users.size} users and ${this.transactions.size} transactions from storage`);
      }
    } catch (error) {
      console.error('Error loading data from storage file:', error);
      // Initialize with empty data on error
      this.users = new Map();
      this.transactions = new Map();
      this.currentUserId = 1;
      this.currentTransactionId = 1;
    }
  }

  private saveDataToFile(): void {
    try {
      const storageData: StorageData = {
        users: Object.fromEntries(this.users.entries()),
        transactions: Object.fromEntries(this.transactions.entries()),
        currentUserId: this.currentUserId,
        currentTransactionId: this.currentTransactionId
      };
      
      fs.writeFileSync(
        this.storageFilePath, 
        JSON.stringify(storageData, null, 2)
      );
    } catch (error) {
      console.error('Error saving data to storage file:', error);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      upiId: null, 
      walletBalance: 0, 
      ethereumAddress: null,
      createdAt: now
    };
    this.users.set(id, user);
    this.saveDataToFile();
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    this.saveDataToFile();
    return updatedUser;
  }

  // Transaction methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.senderId === userId || transaction.receiverId === userId,
    );
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const now = new Date();
    const transaction: Transaction = { 
      ...insertTransaction, 
      id, 
      createdAt: now,
      updatedAt: now,
      // Ensure receiverId is never undefined
      receiverId: insertTransaction.receiverId ?? null,
      // Ensure other possibly undefined properties are properly handled
      receiverUpiId: insertTransaction.receiverUpiId ?? null,
      receiverAccountNumber: insertTransaction.receiverAccountNumber ?? null,
      receiverIfscCode: insertTransaction.receiverIfscCode ?? null
    };
    this.transactions.set(id, transaction);
    this.saveDataToFile();
    return transaction;
  }

  async updateTransaction(id: number, data: Partial<Transaction>): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;
    
    const updatedTransaction = { 
      ...transaction, 
      ...data, 
      updatedAt: new Date()
    };
    this.transactions.set(id, updatedTransaction);
    this.saveDataToFile();
    return updatedTransaction;
  }

  async getRecentTransactionsByUserId(userId: number, limit: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.senderId === userId || transaction.receiverId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getMonthlyStats(userId: number): Promise<{ spent: number, received: number }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const userTransactions = Array.from(this.transactions.values())
      .filter(tx => 
        (tx.senderId === userId || tx.receiverId === userId) && 
        tx.status === 'COMPLETED' &&
        tx.createdAt >= startOfMonth
      );
    
    const spent = userTransactions
      .filter(tx => tx.senderId === userId)
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const received = userTransactions
      .filter(tx => tx.receiverId === userId)
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    return { spent, received };
  }
}

// Replace MemStorage with FileStorage
export const storage = new FileStorage();
