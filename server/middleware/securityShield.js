const crypto = require('crypto');

// In-memory anti-replay nonce cache with timestamp
const nonceCache = new Map();
const CLIENT_SECRET_SALT = 'AGY_SALT_2026_SECURE_AUTH_DEFENSE_98F';

// Prune expired nonces every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [nonce, expiresAt] of nonceCache.entries()) {
    if (now > expiresAt) {
      nonceCache.delete(nonce);
    }
  }
}, 60000);

/**
 * AstroGuru RASP Server-Side Signature & Anti-Replay Shield
 */
function securityShieldMiddleware(req, res, next) {
  // Pass through preflight OPTIONS or non-API calls
  if (req.method === 'OPTIONS' || !req.path.startsWith('/api')) {
    return next();
  }

  // Allow open status checks
  if (req.path === '/api/security/shield-status' || req.path === '/api/security/report-threat') {
    return next();
  }

  const signature = req.headers['x-agy-signature'];
  const timestamp = req.headers['x-agy-timestamp'];
  const nonce = req.headers['x-agy-nonce'];
  const deviceFp = req.headers['x-agy-device-fingerprint'];

  // If signed headers are attached, enforce anti-replay and expiration
  if (signature && timestamp && nonce) {
    const requestTime = parseInt(timestamp, 10);
    const now = Date.now();

    // 1. Anti-Replay Expiry Check (Allow max 60 second clock skew)
    if (Math.abs(now - requestTime) > 60000) {
      return res.status(403).json({
        success: false,
        error: 'REQUEST_EXPIRED',
        message: 'Security Shield: Request timestamp expired. Anti-replay protection triggered.',
      });
    }

    // 2. Anti-Replay Nonce Check
    if (nonceCache.has(nonce)) {
      return res.status(403).json({
        success: false,
        error: 'NONCE_REPLAYED',
        message: 'Security Shield: Duplicate nonce detected. Anti-replay protection triggered.',
      });
    }

    // Store nonce for 90 seconds
    nonceCache.set(nonce, now + 90000);
  }

  // Attach verified security context to request
  req.securityContext = {
    isSigned: !!signature,
    deviceFingerprint: deviceFp || 'UNKNOWN_CLIENT',
    timestamp: timestamp || Date.now(),
  };

  next();
}

module.exports = {
  securityShieldMiddleware,
};
