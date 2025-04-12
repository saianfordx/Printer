import { Router } from 'express';
import { PrintController } from '../controllers/PrintController';

const router = Router();
const printController = new PrintController();

// Bind the controller methods to router paths
router.post('/print', (req, res) => printController.printOrder(req, res));
router.get('/status', (req, res) => printController.checkPrinterStatus(req, res));
router.get('/status/detailed', (req, res) => printController.getDetailedPrinterStatus(req, res));

export default router; 