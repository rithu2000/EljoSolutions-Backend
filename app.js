import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import userRoute from './routes/userRoute.js';
import { errorHandler } from './middleware/errorHandler.js';
import sequelize from './config/database.js';

// Path and Port
const app = express();
const port = 8000;

// Use
app.use(express.json());
app.use(
    cors({
        origin: ["http://localhost:3000"],
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true,
        exposedHeaders: ["Content-Length", "X-Foo", "X-Bar"],
    })
);
app.use('/api', userRoute);
app.use(errorHandler);

// Sync database and start server
sequelize.sync()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        })
            .on('error', (error) => {
                console.error('Error starting server:', error.message);
                process.exit(1);
            });
    })
    .catch((error) => {
        console.error('Invalid Database connection:', error.message);
    });