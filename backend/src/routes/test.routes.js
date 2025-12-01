import express from 'express';
import { testError, testSuccess } from '../controllers/test.controller.js';

const router = express.Router();

router.get('/error', testError);
router.get('/success', testSuccess);

export default router;