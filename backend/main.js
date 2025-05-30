const express = require('express');
require('dotenv').config();
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// DB Connection
const dbConnect = require('./src/config/dbConnect.js');
dbConnect();

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Routes
const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

const userRoutes = require('./src/routes/userRoutes.js');
app.use('/api/user', userRoutes);

// Default Route
app.get('/', (req, res) => {
    res.status(200).send('Event Management API is running...');
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ msg: 'Endpoint not found' });
});

// Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});
