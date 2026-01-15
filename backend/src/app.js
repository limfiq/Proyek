const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test Route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to PKL Management System API' });
});

// Routes
const authRoutes = require('./routes/authRoutes');
const masterRoutes = require('./routes/masterRoutes');
const pklRoutes = require('./routes/pklRoutes');
const nilaiRoutes = require('./routes/nilaiRoutes');
const publicRoutes = require('./routes/publicRoutes');
app.use('/auth', authRoutes);
app.use('/api', masterRoutes);
app.use('/api', pklRoutes);
app.use('/api', nilaiRoutes);
app.use('/api/public', publicRoutes);

// Database Sync & Server Start
const db = require('./models');

const startServer = async () => {
    try {
        await db.sequelize.authenticate();
        console.log('Database connection has been established successfully.');

        // Sync models with database (alter: true updates schema without dropping data)
        await db.sequelize.sync({ alter: false });
        console.log('Database synced.');

        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

startServer();
