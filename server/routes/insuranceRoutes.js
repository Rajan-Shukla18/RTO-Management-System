import express from 'express';
import { getInsurance, createInsurance, updateInsurance, deleteInsurance } from '../controllers/insuranceController.js';

const router = express.Router();

router.get('/', getInsurance);
router.post('/', createInsurance);
router.put('/:id', updateInsurance);
router.delete('/:id', deleteInsurance);

export default router;
