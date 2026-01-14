import jwt from 'jsonwebtoken';

export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    return { valid: true, decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

export const authenticateUser = (req) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return { authenticated: false, error: 'Access token required' };
  }

  const { valid, decoded, error } = verifyToken(token);

  if (!valid) {
    return { authenticated: false, error };
  }

  return { authenticated: true, user: decoded };
};