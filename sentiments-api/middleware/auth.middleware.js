import jwt from 'jsonwebtoken'

export const verifyToken = (req, res, next) => {
  console.log("auth verif")
  const token = req.headers.authorization?.split(' ')[1] // Expecting Bearer token

  if (!token) {
    return res.status(401).json({ message: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    res.status(403).json({ message: 'Invalid token' })
  }
}

export const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] // Expecting Bearer token

  if (!token) {
    // No token provided, continue without authentication
    req.user = null
    return next()
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    // Invalid token, continue without authentication
    req.user = null
    next()
  }
}

export function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admins only.' })
  }
  next()
}

export function requireStaff(req, res, next) {
  if (req.user.role !== 'staff' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Staff members only.' })
  }
  next()
}
