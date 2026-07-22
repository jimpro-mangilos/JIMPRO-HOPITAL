import { Request, Response } from 'express';
import { billingService } from './billing.service';

export class BillingController {
  async createInvoice(req: Request, res: Response) {
    try { res.status(201).json(await billingService.createInvoice(req.body)); }
    catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }
  async findAll(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      res.json(await billingService.findAll(page, limit));
    } catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }
  async findById(req: Request, res: Response) {
    try { res.json(await billingService.findById(req.params.id)); }
    catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }
  async update(req: Request, res: Response) {
    try { res.json(await billingService.update(req.params.id, req.body)); }
    catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }
  async addLine(req: Request, res: Response) {
    try { res.json(await billingService.addLine(req.params.id, req.body)); }
    catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }
  async removeLine(req: Request, res: Response) {
    try { res.json(await billingService.removeLine(req.params.lineId)); }
    catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }
  async recordPayment(req: Request, res: Response) {
    try {
      const { amount, paymentMethod } = req.body;
      res.json(await billingService.recordPayment(req.params.id, amount, paymentMethod));
    } catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }
  async getByPatient(req: Request, res: Response) {
    try { res.json(await billingService.getByPatient(req.params.patientId)); }
    catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }
  async getOutstanding(_req: Request, res: Response) {
    try { res.json(await billingService.getOutstanding()); }
    catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }
  async getDailyRevenue(req: Request, res: Response) {
    try { res.json(await billingService.getDailyRevenue(req.query.date as string)); }
    catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }
  async getMonthlyReport(req: Request, res: Response) {
    try {
      const year = parseInt(req.query.year as string) || undefined;
      const month = parseInt(req.query.month as string) || undefined;
      res.json(await billingService.getMonthlyReport(year, month));
    } catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }
}

export const billingController = new BillingController();
