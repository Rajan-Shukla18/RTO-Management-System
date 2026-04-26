import express from 'express';
import { getLicenses, createLicense, updateLicense, deleteLicense } from '../controllers/licenseController.js';

const router = express.Router();

router.get('/', getLicenses);
router.post('/', createLicense);
router.put('/:id', updateLicense);
router.delete('/:id', deleteLicense);

export default router;
