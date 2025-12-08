const express = require('express');
require('dotenv').config();
const { connectToMongoDB } = require('./shared/config/database.config');
const v1Routes = require('./api/v1');

const AppError = require('./shared/utils/appError.utils');
const globalErrorHandler = require('./shared/middlewares/ErrorHandeler.middleware');


const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json())

app.use('/api/v1', v1Routes);


// 404 handler
app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`))
})

app.use(globalErrorHandler)


// DB Connection & Server Start
connectToMongoDB();
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});