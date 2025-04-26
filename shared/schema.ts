import { pgTable, text, serial, integer, numeric, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const borrowers = pgTable("borrowers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
});

export const loans = pgTable("loans", {
  id: serial("id").primaryKey(),
  borrowerId: integer("borrower_id").notNull(),
  principal: numeric("principal").notNull(),
  interestRate: numeric("interest_rate").notNull(),
  issueDate: timestamp("issue_date").notNull().defaultNow(),
  dueDate: timestamp("due_date").notNull(),
  status: text("status").notNull().default("active"),
  notes: text("notes"),
  frequency: text("frequency").notNull().default("monthly"),
  nextPaymentDate: timestamp("next_payment_date"),
  installments: integer("installments"),
  installmentAmount: numeric("installment_amount"),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  loanId: integer("loan_id").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  amount: numeric("amount").notNull(),
  principal: numeric("principal").notNull(),
  interest: numeric("interest").notNull(),
  notes: text("notes"),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  defaultInterestRate: numeric("default_interest_rate").notNull().default("2.0"),
  defaultFrequency: text("default_frequency").notNull().default("monthly"),
  defaultInstallments: integer("default_installments").notNull().default(12),
  currency: text("currency").notNull().default("R$"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertBorrowerSchema = createInsertSchema(borrowers);

export const insertLoanSchema = createInsertSchema(loans).omit({
  id: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertBorrower = z.infer<typeof insertBorrowerSchema>;
export type Borrower = typeof borrowers.$inferSelect;

export type InsertLoan = z.infer<typeof insertLoanSchema>;
export type Loan = typeof loans.$inferSelect;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;
