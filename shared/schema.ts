import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull(),
  upiId: text("upi_id"),
  walletBalance: doublePrecision("wallet_balance").notNull().default(0),
  ethereumAddress: text("ethereum_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  receiverId: integer("receiver_id").references(() => users.id),
  receiverUpiId: text("receiver_upi_id"),
  receiverAccountNumber: text("receiver_account_number"),
  receiverIfscCode: text("receiver_ifsc_code"),
  receiverEthAddress: text("receiver_eth_address"),
  amount: doublePrecision("amount").notNull(),
  currency: text("currency").notNull().default("INR"),
  type: text("type").notNull(), // UPI, BANK, INTERNATIONAL
  status: text("status").notNull(), // PENDING, COMPLETED, FAILED
  note: text("note"),
  verificationCode: text("verification_code"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  senderId: true,
  receiverId: true,
  receiverUpiId: true,
  receiverAccountNumber: true,
  receiverIfscCode: true,
  receiverEthAddress: true,
  amount: true,
  currency: true,
  type: true,
  status: true,
  note: true,
  verificationCode: true,
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions"
  })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export const upiPaymentSchema = z.object({
  upiId: z.string().min(1, "UPI ID is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  note: z.string().optional(),
  pin: z.string().min(4, "PIN must be at least 4 characters"),
});

export const bankTransferSchema = z.object({
  beneficiaryName: z.string().min(1, "Beneficiary name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  ifscCode: z.string().min(1, "IFSC code is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  note: z.string().optional(),
});

export const internationalPaymentSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  currency: z.string().min(1, "Currency is required"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
