const express = require('express');
require('dotenv').config();
const { connectToMongoDB } = require('./shared/config/database.config');
const v1Routes = require('./api/v1');
const cors = require('cors');
const http = require("http");
const { initializeSocketIO } = require("./sockets");

const AppError = require('./shared/utils/appError.utils');
const globalErrorHandler = require('./shared/middlewares/ErrorHandeler.middleware');

const PORT = process.env.PORT || 3000;

const app = express();

// ✅ Create HTTP server
const server = http.createServer(app);

// ✅ Init socket.io
initializeSocketIO(server);

app.post(
  "/api/v1/payments/stripe/webhook",
  express.raw({ type: "application/json" }),
  require("./api/v1/controller/paymentStripe.controller").handleStripeWebhook
);

app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use('/api/v1', v1Routes);

// 404 handler
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`));
});

app.use(globalErrorHandler);

// DB Connection
connectToMongoDB();

// ✅ IMPORTANT: listen on SERVER, not app
server.listen(PORT, () => {
  console.log(`🚀 Server + Socket.IO running on port ${PORT}`);
});
