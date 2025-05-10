import crypto from "crypto";

/**
 * Encryption and decryption utility functions using AES-256-GCM
 *
 * AES-256-GCM provides authenticated encryption with associated data (AEAD)
 * which ensures both confidentiality and integrity of the encrypted data.
 */
export class Encryption {
  private readonly algorithm = "aes-256-gcm";
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits
  private readonly authTagLength = 16; // 128 bits
  private readonly saltLength = 64; // For key derivation
  private readonly pbkdf2Iterations = 100000; // Recommended value for PBKDF2
  private readonly pbkdf2Digest = "sha512";

  /**
   * Derives a cryptographic key from a password and salt using PBKDF2
   *
   * @param password - The password to derive the key from
   * @param salt - The salt to use (or undefined to generate a new one)
   * @returns An object containing the derived key and the salt used
   */
  private async deriveKey(password: string, salt?: Buffer): Promise<{ key: Buffer; salt: Buffer }> {
    const actualSalt = salt || crypto.randomBytes(this.saltLength);

    return new Promise((resolve, reject) => {
      crypto.pbkdf2(
        password,
        actualSalt,
        this.pbkdf2Iterations,
        this.keyLength,
        this.pbkdf2Digest,
        (err, derivedKey) => {
          if (err) return reject(err);
          resolve({ key: derivedKey, salt: actualSalt });
        },
      );
    });
  }

  /**
   * Encrypts data using AES-256-GCM with a password
   *
   * @param data - The data to encrypt (string or Buffer)
   * @param password - The password to use for encryption
   * @returns The encrypted data as a base64 string in the format:
   *          base64(salt + iv + authTag + ciphertext)
   */
  async encrypt(data: string | Buffer, password: string): Promise<string> {
    try {
      // Generate random initialization vector
      const iv = crypto.randomBytes(this.ivLength);

      // Convert data to Buffer if it's a string
      const dataBuffer = typeof data === "string" ? Buffer.from(data, "utf8") : data;

      // Derive key from password
      const { key, salt } = await this.deriveKey(password);

      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);

      // Encrypt data
      const encrypted = Buffer.concat([cipher.update(dataBuffer), cipher.final()]);

      // Get authentication tag
      const authTag = cipher.getAuthTag();

      // Combine all components: salt + iv + authTag + ciphertext
      const result = Buffer.concat([salt, iv, authTag, encrypted]);

      // Return as base64 string
      return result.toString("base64");
    } catch (error) {
      throw new Error(`Encryption failed: ${(error as Error).message}`);
    }
  }

  /**
   * Decrypts data that was encrypted with the encrypt method
   *
   * @param encryptedData - The encrypted data as a base64 string
   * @param password - The password used for encryption
   * @param outputEncoding - Optional encoding for the output (default is utf8)
   * @returns The decrypted data (as string with specified encoding or as Buffer)
   */
  async decrypt(
    encryptedData: string,
    password: string,
    outputEncoding?: BufferEncoding,
  ): Promise<string | Buffer> {
    try {
      // Decode base64 data
      const encryptedBuffer = Buffer.from(encryptedData, "base64");

      // Extract components
      const salt = encryptedBuffer.subarray(0, this.saltLength);
      const iv = encryptedBuffer.subarray(this.saltLength, this.saltLength + this.ivLength);
      const authTag = encryptedBuffer.subarray(
        this.saltLength + this.ivLength,
        this.saltLength + this.ivLength + this.authTagLength,
      );
      const encrypted = encryptedBuffer.subarray(
        this.saltLength + this.ivLength + this.authTagLength,
      );

      // Derive key from password and salt
      const { key } = await this.deriveKey(password, salt);

      // Create decipher
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      decipher.setAuthTag(authTag);

      // Decrypt data
      const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

      // Return as string if encoding is specified, otherwise as Buffer
      return outputEncoding ? decrypted.toString(outputEncoding) : decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${(error as Error).message}`);
    }
  }

  /**
   * Generates a secure random string that can be used as a password or key
   *
   * @param length - The length of the random string (default is 32)
   * @returns A secure random string
   */
  generateSecureKey(length: number = 32): string {
    return crypto.randomBytes(length).toString("base64");
  }

  /**
   * Creates a hash of data using SHA-512
   *
   * @param data - The data to hash
   * @returns The hash as a hex string
   */
  createHash(data: string | Buffer): string {
    const dataBuffer = typeof data === "string" ? Buffer.from(data, "utf8") : data;
    return crypto.createHash("sha512").update(dataBuffer).digest("hex");
  }

  /**
   * Verifies if the provided data matches a hash
   *
   * @param data - The data to verify
   * @param hash - The hash to compare against
   * @returns True if the hash of the data matches the provided hash
   */
  verifyHash(data: string | Buffer, hash: string): boolean {
    const computedHash = this.createHash(data);
    return crypto.timingSafeEqual(Buffer.from(computedHash, "hex"), Buffer.from(hash, "hex"));
  }
}

// Create a singleton instance
const encryption = new Encryption();

export default encryption;
