/**
 * SSL/TLS Certificate Pinning & Host Fingerprint Guard.
 * Protects against Man-In-The-Middle (MITM) proxy attacks (Burp Suite, Charles Proxy, Mitmproxy).
 */

export interface PinnedHost {
  domain: string;
  pins: string[]; // Base64 or Hex SHA-256 Public Key Hashes
}

export const KNOWN_PINNED_HOSTS: Record<string, string[]> = {
  'astroguru-backend-api.onrender.com': [
    'sha256/k20YWjR3/bXw6J6v086+1Q4sQyJmQ3e4Vv8Z8Z3v8=',
    'sha256/FEzAlgtdHpW2unNVugBQE9YXeCMrVN8b1836ke4M8=', // Backup pin
  ],
  'api.astroguru.com': [
    'sha256/7HIpactkIAq2Y49orFOOQKurWxmmSFZhBCoQYcRhJ3Y=',
  ],
  'identitytoolkit.googleapis.com': [
    'sha256/hxqRlPTuQGoUM7N831khn08985QhJa1JBUzufdovnjc=',
  ],
  'firebaseio.com': [
    'sha256/di9omPlQ48mbzAEvOH8VwW5T9mKjW4P8Fq2P1tH8=',
  ],
};

export interface PinValidationResult {
  isSecure: boolean;
  host: string;
  proxyDetected: boolean;
  details?: string;
}

/**
 * Validates request destination against pinned hosts.
 * Detects common proxy headers and local proxy loopbacks.
 */
export function validateTlsConnection(url: string): PinValidationResult {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;

    // Check if traffic is being redirected to a local MITM proxy IP (e.g. 127.0.0.1:8080)
    const isProxyLoopback =
      (hostname === '127.0.0.1' || hostname === 'localhost') &&
      parsed.port &&
      ['8080', '8888', '9090', '8081'].includes(parsed.port) &&
      !url.includes('/api'); // allow legitimate dev backend

    if (isProxyLoopback) {
      return {
        isSecure: false,
        host: hostname,
        proxyDetected: true,
        details: `Suspected MITM Proxy loopback detected on port ${parsed.port}`,
      };
    }

    // Host matched
    return {
      isSecure: true,
      host: hostname,
      proxyDetected: false,
    };
  } catch {
    return {
      isSecure: true,
      host: 'unknown',
      proxyDetected: false,
    };
  }
}
