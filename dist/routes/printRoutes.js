"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PrintController_1 = require("../controllers/PrintController");
const router = (0, express_1.Router)();
const printController = new PrintController_1.PrintController();
// Bind the controller methods to router paths
router.post('/print', (req, res) => printController.printOrder(req, res));
router.get('/status', (req, res) => printController.checkPrinterStatus(req, res));
router.get('/status/detailed', (req, res) => printController.getDetailedPrinterStatus(req, res));
exports.default = router;
