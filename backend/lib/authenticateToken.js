import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).json({ message: 'Token wymagany!' });
    const jwtSecretKey = process.env.JWTSECRETKEY;
    jwt.verify(token, jwtSecretKey, (err, user) => {
      if (err) return res.status(403).json({ message: 'Nieprawidłowy token!' });
      req.user = user;
      next();
    });
  };
