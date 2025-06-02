
const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token and attach user to request
 */
exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.warn('⚠️ No token or incorrect format');
        return res.status(401).json({ msg: 'Access denied: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Attach user id and role to request
        req.user = {
            id: decoded.id,
            role: decoded.role,
        };
        next();
    } catch (err) {
        console.error('❌ Invalid token:', err.message);
        return res.status(401).json({ msg: 'Access denied: Invalid token' });
    }
};

/**
 * Middleware to restrict access to admin only
 */
exports.isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        console.warn('⛔ Admin access denied');
        return res.status(403).json({ msg: 'Admin access only' });
    }
    next();
};
