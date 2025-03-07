const jwt = require('jsonwebtoken');


//* Create a token
function createToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
}

//* Validate token
function validateToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

//* Authenticate users
function authenticateUser(req, res, next) {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access Denied' });   
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Authentication failed' });
    }
}


//* Check if the user is a supervisor
function isSupervisor(req, res, next) {
    if (req.user.role !== 'supervisor') return res.status(403).json({ message: 'Access Denied' });
    next();
}


//* Export the functions
module.exports = {
    createToken,
    validateToken,
    authenticateUser,
    isSupervisor
}