import express from 'express';
import { exampleController, anotherExample } from '../controllers/loggingExample.controller.js';

const router = express.Router();

// Example routes to demonstrate logging
router.get('/example', exampleController);
router.get('/another-example', anotherExample);

export default router;