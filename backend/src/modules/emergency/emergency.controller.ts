import { Request, Response } from 'express';
import { emergencyService } from './emergency.service';

export class EmergencyController {
  async create(req: Request, res: Response) {
    try { res.status(201).json(await emergencyService.create(req.body)); }
    catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }
  async findAll(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      res.json(await emergencyService.findAll(page, limit));
    } catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }
  async findById(req: Request, res: Response) {
    try { res.json(await emergencyService.findById(req.params.id)); }
    catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }
  async triage(req: Request, res: Response) {
    try {
      const { triageLevel, notes } = req.body;
      res.json(await emergencyService.triage(req.params.id, triageLevel, notes));
    } catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }
  async assign(req: Request, res: Response) {
    try {
      const { assignedTo } = req.body;
      res.json(await emergencyService.assign(req.params.id, assignedTo));
    } catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }
  async updateStatus(req: Request, res: Response) {
    try {
      const { status, disposition, notes } = req.body;
      res.json(await emergencyService.updateStatus(req.params.id, status, disposition, notes));
    } catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }
  async getActiveEmergencies(_req: Request, res: Response) {
    try { res.json(await emergencyService.getActiveEmergencies()); }
    catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }
  async getByTriageLevel(req: Request, res: Response) {
    try { res.json(await emergencyService.getByTriageLevel(req.params.level)); }
    catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }
}

export const emergencyController = new EmergencyController();
