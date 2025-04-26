import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertBorrowerSchema, 
  insertLoanSchema, 
  insertPaymentSchema, 
  insertSettingsSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Borrowers endpoints
  app.get("/api/borrowers", async (req: Request, res: Response) => {
    try {
      const borrowers = await storage.getAllBorrowers();
      res.json(borrowers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch borrowers" });
    }
  });

  app.get("/api/borrowers/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const borrower = await storage.getBorrower(id);
      
      if (!borrower) {
        return res.status(404).json({ message: "Borrower not found" });
      }
      
      res.json(borrower);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch borrower" });
    }
  });

  app.post("/api/borrowers", async (req: Request, res: Response) => {
    try {
      const validatedData = insertBorrowerSchema.parse(req.body);
      const newBorrower = await storage.createBorrower(validatedData);
      res.status(201).json(newBorrower);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid borrower data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create borrower" });
    }
  });

  app.patch("/api/borrowers/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertBorrowerSchema.partial().parse(req.body);
      
      const updatedBorrower = await storage.updateBorrower(id, validatedData);
      
      if (!updatedBorrower) {
        return res.status(404).json({ message: "Borrower not found" });
      }
      
      res.json(updatedBorrower);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid borrower data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update borrower" });
    }
  });

  app.delete("/api/borrowers/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteBorrower(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Borrower not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete borrower" });
    }
  });

  // Loans endpoints
  app.get("/api/loans", async (req: Request, res: Response) => {
    try {
      const loans = await storage.getAllLoans();
      res.json(loans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch loans" });
    }
  });

  app.get("/api/loans/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const loan = await storage.getLoan(id);
      
      if (!loan) {
        return res.status(404).json({ message: "Loan not found" });
      }
      
      res.json(loan);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch loan" });
    }
  });

  app.get("/api/borrowers/:id/loans", async (req: Request, res: Response) => {
    try {
      const borrowerId = parseInt(req.params.id);
      const loans = await storage.getLoansByBorrowerId(borrowerId);
      res.json(loans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch loans for borrower" });
    }
  });

  app.post("/api/loans", async (req: Request, res: Response) => {
    try {
      const validatedData = insertLoanSchema.parse(req.body);
      const newLoan = await storage.createLoan(validatedData);
      res.status(201).json(newLoan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid loan data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create loan" });
    }
  });

  app.patch("/api/loans/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertLoanSchema.partial().parse(req.body);
      
      const updatedLoan = await storage.updateLoan(id, validatedData);
      
      if (!updatedLoan) {
        return res.status(404).json({ message: "Loan not found" });
      }
      
      res.json(updatedLoan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid loan data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update loan" });
    }
  });

  app.delete("/api/loans/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteLoan(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Loan not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete loan" });
    }
  });

  // Payments endpoints
  app.get("/api/payments", async (req: Request, res: Response) => {
    try {
      const payments = await storage.getAllPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.get("/api/loans/:id/payments", async (req: Request, res: Response) => {
    try {
      const loanId = parseInt(req.params.id);
      const payments = await storage.getPaymentsByLoanId(loanId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments for loan" });
    }
  });

  app.post("/api/payments", async (req: Request, res: Response) => {
    try {
      const validatedData = insertPaymentSchema.parse(req.body);
      const newPayment = await storage.createPayment(validatedData);
      
      // Update loan status based on payment
      const loan = await storage.getLoan(validatedData.loanId);
      if (loan) {
        // Simple update for now - in a real app, this would use the loan calculation utils
        // to determine the new status, remaining balance, etc.
        await storage.updateLoan(loan.id, {
          nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });
      }
      
      res.status(201).json(newPayment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid payment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  app.patch("/api/payments/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPaymentSchema.partial().parse(req.body);
      
      const updatedPayment = await storage.updatePayment(id, validatedData);
      
      if (!updatedPayment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      res.json(updatedPayment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid payment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update payment" });
    }
  });

  app.delete("/api/payments/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePayment(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete payment" });
    }
  });

  // Settings endpoints
  app.get("/api/settings", async (req: Request, res: Response) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.patch("/api/settings", async (req: Request, res: Response) => {
    try {
      const validatedData = insertSettingsSchema.partial().parse(req.body);
      const updatedSettings = await storage.updateSettings(validatedData);
      res.json(updatedSettings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid settings data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
