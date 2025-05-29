// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.warn('⚠️ No token or incorrect token format in request');
        return res.status(401).json({ msg: 'Access denied: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        console.warn('Token missing after Bearer');
        return res.status(401).json({ msg: 'Access denied: Token missing' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Invalid token:', error.message);
        return res.status(401).json({ msg: 'Access denied: Invalid token' });
    }
};

exports.isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        console.warn('Admin access denied');
        return res.status(403).json({ msg: 'Admin access only' });
    }
    next();
};
