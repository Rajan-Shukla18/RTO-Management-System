import express from 'express';
import { getOffices, createOffice, updateOffice, deleteOffice } from '../controllers/officeController.js';

const router = express.Router();

router.get('/', getOffices);
router.post('/', createOffice);
router.put('/:id', updateOffice);
router.delete('/:id', deleteOffice);

export default router;
