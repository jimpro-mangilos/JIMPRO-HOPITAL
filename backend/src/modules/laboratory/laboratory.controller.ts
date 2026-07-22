import { Request, Response } from 'express';
import { laboratoryService } from './laboratory.service';

export class LaboratoryController {
  // Requests
  async createRequest(req: Request, res: Response) {
    try {
      const request = await laboratoryService.createRequest(req.body);
      res.status(201).json(request);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async findAllRequests(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await laboratoryService.findAllRequests(page, limit);
      res.json(result);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async findRequestById(req: Request, res: Response) {
    try {
      const request = await laboratoryService.findRequestById(req.params.id);
      res.json(request);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async updateRequestStatus(req: Request, res: Response) {
    try {
      const { status, notes } = req.body;
      const request = await laboratoryService.updateRequestStatus(req.params.id, status, notes);
      res.json(request);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async getByPatient(req: Request, res: Response) {
    try {
      const requests = await laboratoryService.getByPatient(req.params.patientId);
      res.json(requests);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async getPendingTests(_req: Request, res: Response) {
    try {
      const pending = await laboratoryService.getPendingTests();
      res.json(pending);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  // Results
  async createResult(req: Request, res: Response) {
    try {
      const result = await laboratoryService.createResult(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async findAllResults(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const result = await laboratoryService.findAllResults(page, limit);
      res.json(result);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }
}

export const laboratoryController = new LaboratoryController();
