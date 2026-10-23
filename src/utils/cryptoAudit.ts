import { AuditEvent } from '../types';

/**
 * Standard SHA-256 implementation for deterministic, portable cryptographic hashing
 * Operates synchronously and works in all browser and Node.js environments.
 */
function sha256Sync(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let i = 0, j = 0;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;

  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  ascii += '\x80';
  while ((ascii.length % 64) - 56) ascii += '\x00';

  for (i = 0; i < ascii.length; i++) {
    j = ascii.charCodeAt(i);
    words[i >> 2] |= j << ((3 - (i % 4)) * 8);
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength;

  for (j = 0; j < words.length;) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash;
    hash = hash.slice(0, 8);

    for (i = 0; i < 64; i++) {
      const s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      const s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      w[i] = i < 16 ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0;

      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp1 = (hash[7] + (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) + ch + k[i] + w[i]) | 0;
      const temp2 = ((rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) + maj) | 0;

      hash = [(temp1 + temp2) | 0, hash[0], hash[1], hash[2], (hash[3] + temp1) | 0, hash[4], hash[5], hash[6]];
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

export const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Computes deterministic SHA-256 hash for an audit event block
 */
export function computeEventHash(event: Omit<AuditEvent, 'hash'> & { prevHash?: string }): string {
  const payload = [
    event.prevHash || GENESIS_HASH,
    event.id,
    event.timestamp,
    event.action,
    event.actor,
    event.details,
    event.type,
  ].join('::');

  return sha256Sync(payload);
}

/**
 * Seals an audit event by calculating its block hash and linking to previous block
 */
export function sealAuditEvent(
  event: Omit<AuditEvent, 'hash' | 'prevHash'>,
  latestEventInChain?: AuditEvent
): AuditEvent {
  const prevHash = latestEventInChain?.hash || GENESIS_HASH;
  const hash = computeEventHash({ ...event, prevHash });
  return {
    ...event,
    prevHash,
    hash,
  };
}

export interface VerificationResult {
  isValid: boolean;
  totalEvents: number;
  verifiedCount: number;
  rootHash: string | null;
  genesisHash: string;
  brokenIndex?: number;
  brokenReason?: string;
}

/**
 * Cryptographically verifies an entire audit trail hash chain
 * Timeline is chronological (oldest to newest: index 0 is oldest, or reverse if stored descending).
 * We normalize chronologically.
 */
export function verifyAuditChain(events: AuditEvent[]): VerificationResult {
  if (!events || events.length === 0) {
    return {
      isValid: true,
      totalEvents: 0,
      verifiedCount: 0,
      rootHash: null,
      genesisHash: GENESIS_HASH,
    };
  }

  // Sort chronologically ascending for verification
  const chronological = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  let expectedPrevHash = GENESIS_HASH;

  for (let i = 0; i < chronological.length; i++) {
    const item = chronological[i];

    // If an item lacks a hash, it's not cryptographically sealed
    if (!item.hash) {
      return {
        isValid: false,
        totalEvents: events.length,
        verifiedCount: i,
        rootHash: null,
        genesisHash: GENESIS_HASH,
        brokenIndex: i,
        brokenReason: `Block ${i} (${item.action}) lacks a cryptographic seal.`,
      };
    }

    // Verify linkage to previous block
    const blockPrev = item.prevHash || GENESIS_HASH;
    if (i === 0) {
      if (blockPrev !== GENESIS_HASH && blockPrev.length !== 64) {
        return {
          isValid: false,
          totalEvents: events.length,
          verifiedCount: 0,
          rootHash: null,
          genesisHash: GENESIS_HASH,
          brokenIndex: 0,
          brokenReason: `Genesis block does not link to valid genesis root.`,
        };
      }
    } else {
      if (blockPrev !== expectedPrevHash) {
        return {
          isValid: false,
          totalEvents: events.length,
          verifiedCount: i,
          rootHash: null,
          genesisHash: GENESIS_HASH,
          brokenIndex: i,
          brokenReason: `Hash linkage mismatch at block ${i}: expected prevHash ${expectedPrevHash.slice(0, 8)}..., found ${blockPrev.slice(0, 8)}...`,
        };
      }
    }

    // Recompute block hash
    const recomputed = computeEventHash({
      id: item.id,
      timestamp: item.timestamp,
      action: item.action,
      actor: item.actor,
      details: item.details,
      type: item.type,
      prevHash: blockPrev,
    });

    if (recomputed !== item.hash) {
      return {
        isValid: false,
        totalEvents: events.length,
        verifiedCount: i,
        rootHash: null,
        genesisHash: GENESIS_HASH,
        brokenIndex: i,
        brokenReason: `Tamper detected at block ${i} (${item.action}): calculated hash ${recomputed.slice(0, 8)}... does not match sealed hash ${item.hash.slice(0, 8)}...`,
      };
    }

    expectedPrevHash = item.hash;
  }

  return {
    isValid: true,
    totalEvents: events.length,
    verifiedCount: events.length,
    rootHash: expectedPrevHash,
    genesisHash: GENESIS_HASH,
  };
}
