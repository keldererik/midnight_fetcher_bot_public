/**
 * Generate a random 64-bit nonce (16 hex characters)
 * CRITICAL: Must be exactly 16 hex chars (64 bits)
 * @param workerId - Optional worker ID (0-15) to ensure different nonce spaces per worker
 *
 * NOTE: For batch processing, prefer using sequential nonces instead of calling this repeatedly.
 * Each worker should have its own sequential range (like midnight-scavenger-bot):
 * - Worker 0: 0x0000000000000000 - 0x000000003B9AC9FF (1 billion)
 * - Worker 1: 0x000000003B9ACA00 - 0x00000000773593FF (1 billion)
 * etc.
 */
export function generateNonce(workerId: number = 0): string {
  const bytes = new Uint8Array(8);

  // Use workerId as the first byte to partition nonce space across workers
  // This ensures workers 0-15 explore completely different nonce ranges
  bytes[0] = workerId & 0xFF;

  // Fill remaining 7 bytes with random data
  for (let i = 1; i < 8; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }

  const nonce = Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Guard: Verify output is exactly 16 hex characters
  if (nonce.length !== 16) {
    throw new Error(`Generated nonce has invalid length: ${nonce.length}, expected 16`);
  }

  return nonce;
}

/**
 * Convert a number to a 16-character hex nonce (like midnight-scavenger-bot)
 * @param num - The number to convert (0 to 2^64-1)
 * @returns 16-character hex string
 */
export function numberToNonce(num: number): string {
  return num.toString(16).padStart(16, '0');
}

/**
 * Get the nonce range for a specific worker (1 billion nonces per worker)
 * @param workerId - Worker ID (0-10)
 * @returns Object with start and end nonce values
 */
export function getWorkerNonceRange(workerId: number): { start: number; end: number } {
  const NONCE_RANGE_SIZE = 1_000_000_000; // 1 billion per worker
  const start = workerId * NONCE_RANGE_SIZE;
  const end = start + NONCE_RANGE_SIZE;
  return { start, end };
}
