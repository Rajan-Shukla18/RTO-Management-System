import express from 'express';
import { getRegistrations, createRegistration, updateStatus, deleteRegistration } from '../controllers/registrationController.js';

const router = express.Router();

router.get('/', getRegistrations);
router.post('/', createRegistration);
router.patch('/:id/status', updateStatus);
router.delete('/:id', deleteRegistration);

export default router;
