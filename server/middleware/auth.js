const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // 1. Header se token nikalo
  const token = req.header('x-auth-token');

  // 2. Agar token nahi hai
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // 3. Token verify karo
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Debugging ke liye (Terminal mein dikhega)
    console.log("decoded user:", decoded.user); 

    req.user = decoded.user;
    next();
  } catch (err) {
    console.error("Token Error:", err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};