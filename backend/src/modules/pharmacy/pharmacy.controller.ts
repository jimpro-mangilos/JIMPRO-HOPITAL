import { Request, Response } from 'express';
import { pharmacyService } from './pharmacy.service';

export class PharmacyController {
  // Medications
  async createMedication(req: Request, res: Response) {
    try {
      const med = await pharmacyService.createMedication(req.body);
      res.status(201).json(med);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async findAllMedications(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const result = await pharmacyService.findAllMedications(page, limit);
      res.json(result);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async findMedicationById(req: Request, res: Response) {
    try {
      const med = await pharmacyService.findMedicationById(req.params.id);
      res.json(med);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async updateMedication(req: Request, res: Response) {
    try {
      const med = await pharmacyService.updateMedication(req.params.id, req.body);
      res.json(med);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async searchMedications(req: Request, res: Response) {
    try {
      const results = await pharmacyService.searchMedications(req.query.q as string);
      res.json(results);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  // Stock
  async findAllStock(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const result = await pharmacyService.findAllStock(page, limit);
      res.json(result);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async createStock(req: Request, res: Response) {
    try {
      const stock = await pharmacyService.createStock(req.body);
      res.status(201).json(stock);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async addStock(req: Request, res: Response) {
    try {
      const { quantity } = req.body;
      const stock = await pharmacyService.addStock(req.params.id, quantity);
      res.json(stock);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async removeStock(req: Request, res: Response) {
    try {
      const { quantity } = req.body;
      const stock = await pharmacyService.removeStock(req.params.id, quantity);
      res.json(stock);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async getLowStock(_req: Request, res: Response) {
    try {
      const stock = await pharmacyService.getLowStock();
      res.json(stock);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async getExpiringSoon(req: Request, res: Response) {
    try {
      const days = parseInt(req.query.days as string) || 90;
      const stock = await pharmacyService.getExpiringSoon(days);
      res.json(stock);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  // Suppliers
  async findAllSuppliers(_req: Request, res: Response) {
    try {
      const suppliers = await pharmacyService.findAllSuppliers();
      res.json(suppliers);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async createSupplier(req: Request, res: Response) {
    try {
      const supplier = await pharmacyService.createSupplier(req.body);
      res.status(201).json(supplier);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async findSupplierById(req: Request, res: Response) {
    try {
      const supplier = await pharmacyService.findSupplierById(req.params.id);
      res.json(supplier);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async updateSupplier(req: Request, res: Response) {
    try {
      const supplier = await pharmacyService.updateSupplier(req.params.id, req.body);
      res.json(supplier);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }
}

export const pharmacyController = new PharmacyController();
