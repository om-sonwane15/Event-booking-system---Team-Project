const express = require('express');
require('dotenv').config();
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, 'src', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// DB Connection
const dbConnect = require('./src/config/dbConnect.js');
dbConnect();

const app = express();

// Middleware
const allowedOrigins = [
  "https://event-booking-system-team-project-mly4cv20f.vercel.app/api", 
  "http://localhost:3000", 
];


app.use(
  cors({
    origin: [
      "https://event-booking-system-team-project.vercel.app",
      "http://localhost:5173" 
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("✅ Backend is running successfully on Render!");
});
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy 💪",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Routes
const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

const userRoutes = require('./src/routes/userRoutes.js');
app.use('/api/user', userRoutes);

const eventRoutes = require('./src/routes/eventRoutes');
app.use('/api/events', eventRoutes);

const eventAdminRoutes = require('./src/routes/eventAdminRoutes');
app.use('/api/admin-events', eventAdminRoutes);

const adminRoutes = require('./src/routes/adminRoutes.js');
app.use('/api/admin', adminRoutes);

// Default Route
router.get("/", async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
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
