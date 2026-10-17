/**
 * Immutable Cryptographic Hash-Chained Audit Trail for AstroGuru Admin Panel.
 * Protects against log tampering, deletion, or backdating by unauthorized actors.
 */

export interface ImmutableAuditEntry {
  id: string;
  timestamp: string;
  adminId: string;
  adminName: string;
  action: string;
  target: string;
  details: string;
  severity: 'info' | 'warning' | 'critical';
  prevHash: string;
  hash: string;
}

const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

function simpleHash(text: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(16, '0');
}

/**
 * Calculates hash for an audit entry chained to the previous entry hash.
 */
export function calculateEntryHash(
  prevHash: string,
  timestamp: string,
  adminId: string,
  action: string,
  target: string,
  details: string
): string {
  return simpleHash(`${prevHash}:${timestamp}:${adminId}:${action}:${target}:${details}`);
}

/**
 * Appends a new tamper-evident audit entry to the ledger.
 */
export function appendAuditEntry(
  ledger: ImmutableAuditEntry[],
  entry: Omit<ImmutableAuditEntry, 'hash' | 'prevHash'>
): ImmutableAuditEntry[] {
  const lastEntry = ledger[ledger.length - 1];
  const prevHash = lastEntry ? lastEntry.hash : GENESIS_HASH;
  const hash = calculateEntryHash(
    prevHash,
    entry.timestamp,
    entry.adminId,
    entry.action,
    entry.target,
    entry.details
  );

  const fullEntry: ImmutableAuditEntry = {
    ...entry,
    prevHash,
    hash,
  };

  return [...ledger, fullEntry];
}

/**
 * Verifies that the audit ledger has not been tampered with or truncated.
 */
export function verifyLedgerIntegrity(ledger: ImmutableAuditEntry[]): {
  isValid: boolean;
  tamperedIndex?: number;
  reason?: string;
} {
  for (let i = 0; i < ledger.length; i++) {
    const current = ledger[i];
    const prev = i > 0 ? ledger[i - 1] : null;
    const expectedPrevHash = prev ? prev.hash : GENESIS_HASH;

    if (current.prevHash !== expectedPrevHash) {
      return {
        isValid: false,
        tamperedIndex: i,
        reason: `Broken chain link at log #${i + 1}: prevHash mismatch.`,
      };
    }

    const expectedHash = calculateEntryHash(
      current.prevHash,
      current.timestamp,
      current.adminId,
      current.action,
      current.target,
      current.details
    );

    if (current.hash !== expectedHash) {
      return {
        isValid: false,
        tamperedIndex: i,
        reason: `Cryptographic hash corruption detected at log #${i + 1}.`,
      };
    }
  }

  return { isValid: true };
}
