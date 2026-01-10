const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: path.resolve(__dirname, envFile) });

if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
  dotenv.config({ path: path.resolve(__dirname, '.env') });
}
const { connectToMongoDB } = require('./shared/config/database.config');
const v1Routes = require('./api/v1');
const cors = require('cors');
const http = require("http");
const { initializeSocketIO } = require("./sockets");

const AppError = require('./shared/utils/appError.utils');
const globalErrorHandler = require('./shared/middlewares/ErrorHandeler.middleware');

const PORT = process.env.PORT;

const app = express();

const server = http.createServer(app);

initializeSocketIO(server);

app.post(
  "/api/v1/payments/stripe/webhook",
  express.raw({ type: "application/json" }),
  require("./api/v1/controller/paymentStripe.controller").handleStripeWebhook
);

app.use(express.json());
app.use(cors({
  origin: ['https://bookify-dashboard-kappa.vercel.app', 'http://localhost:5173', 'http://localhost:3000', 'http://localhost', 'http://localhost:80'],
  credentials: true
}));

// Health check endpoint for Docker
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use('/api/v1', v1Routes);

// 404 handler
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`));
});

app.use(globalErrorHandler);

// DB connection
connectToMongoDB();

server.listen(PORT, () => {
  console.log(`Server + Socket.IO running on port ${PORT}`);
});
