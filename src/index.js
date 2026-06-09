import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createClientsRouter } from './routes/clients.js';
import { createTrainersRouter } from './routes/trainers.js';
import { createEnrollmentsRouter } from './routes/enrollments.js';
import { createPaymentsRouter } from './routes/payments.js';
import { createSessionsRouter } from './routes/sessions.js';
import { createAnalyticsRouter } from './routes/analytics.js';
import { createPayoutsRouter } from './routes/payouts.js';
import { createMembershipPlansRouter } from './routes/membership-plans.js';
import { createAuthRouter } from './routes/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { createAuthMiddleware } from './middleware/auth.js';
import { createSupabaseClient } from './lib/supabase.js';

const app = express();
const PORT = process.env.PORT || 3001;

const supabase = createSupabaseClient();

app.use(helmet());
const corsOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'https://newptsystem-619-frontend.vercel.app'];
app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

const authMw = createAuthMiddleware(supabase);

app.use('/api/auth', createAuthRouter(supabase));
app.use('/api/clients', authMw, createClientsRouter(supabase));
app.use('/api/trainers', authMw, createTrainersRouter(supabase));
app.use('/api/enrollments', authMw, createEnrollmentsRouter(supabase));
app.use('/api/payments', authMw, createPaymentsRouter(supabase));
app.use('/api/sessions', authMw, createSessionsRouter(supabase));
app.use('/api/analytics', authMw, createAnalyticsRouter(supabase));
app.use('/api/payouts', authMw, createPayoutsRouter(supabase));
app.use('/api/membership-plans', authMw, createMembershipPlansRouter(supabase));

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '2.0.0' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🔥 619 PT Studio API running on port ${PORT}`);
});

export default app;
