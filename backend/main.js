const express = require('express');
require('dotenv').config();
const dbConnect = require('./src/config/dbConnect.js');
const cors = require('cors');

// Connect to DB
dbConnect();

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Routes
const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

// Default Route
app.get('/', (req, res) => {
    res.status(200).send('Event Management API is running...');
});

// Handle 404s
app.use((req, res) => {
    res.status(404).json({ msg: 'Endpoint not found' });
});


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});
