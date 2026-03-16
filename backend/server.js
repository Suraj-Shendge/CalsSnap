
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import authMiddleware from './middleware/auth.js';
import scanRouter from './routes/scan.js';
import barcodeRouter from './routes/barcode.js';
import ocrRouter from './routes/ocr.js';
import foodRouter from './routes/food.js';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from './config.js';
import foodSearchRouter from './routes/foodSearch.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ---------- Routes (protected) ----------
app.use('/api/food-search', foodSearchRouter);
app.use('/api/barcode-scan', authMiddleware, barcodeRouter);
app.use('/api/ocr-label', authMiddleware, ocrRouter);
app.use('/api/food', authMiddleware, foodRouter);
app.use('/api/food-search', authMiddleware, foodSearchRouter);

// ---------- Health check ----------
app.get('/', (req, res) => res.send('CalSnap backend is running'));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server listening on ${PORT}`));
