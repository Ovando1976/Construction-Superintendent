// authMiddleware.js

const jwt = require('jsonwebtoken');

/**
 * Middleware: Validates the JWT in the 'Authorization' header (Bearer token).
 * If valid, attaches the decoded user payload to req.user.
 * Otherwise, sends 401 or 403.
 */
const authenticateToken = (req, res, next) => {
  // Expecting header like: Authorization: Bearer <token>
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // e.g. "Bearer abc123..."

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    // Attach decoded user payload (e.g. { id, role }) to the request object
    req.user = user;
    next();
  });
};

/**
 * Middleware: Restricts route access to users with certain roles.
 * e.g. authorizeRoles(['Admin', 'ProjectManager'])
 */
const authorizeRoles = (allowedRoles = []) => {
  return (req, res, next) => {
    // If req.user wasn't set, user is not authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - No user found' });
    }

    const { role } = req.user; // role should be part of the JWT payload
    if (!role) {
      return res.status(403).json({ error: 'Forbidden - Missing user role' });
    }

    // Check if role is in the allowedRoles array
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ error: 'Forbidden - Insufficient role' });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles,
};