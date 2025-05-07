import bcrypt from "bcrypt";

/**
 * This function takes a password as input and returns the hashed password using bcrypt.
 * @param password - The password to be hashed
 * @returns - The hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * This function compares a password with a hashed password using bcrypt.
 * @param password - The password to be compared
 * @param hash - The hashed password to compare against
 * @returns - A boolean indicating whether the password matches the hash
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

/**
 * This function generates a salt string using bcrypt.
 * @returns - A salt string generated using bcrypt
 */
export const generateSalt = async (): Promise<string> => {
  return await bcrypt.genSalt(10);
};

/**
 * This function hashes a password with a provided salt using bcrypt.
 * @param password - The password to be hashed
 * @param salt - The salt to be used for hashing
 * @returns - The hashed password using the provided salt
 */
export const hashWithSalt = async (password: string, salt: string): Promise<string> => {
  return await bcrypt.hash(password, salt);
};

/**
 * This function compares a password with a hashed password using a provided salt.
 * @param password - The password to be compared
 * @param hash - The hashed password to compare against
 * @param salt - The salt to be used for hashing
 * @returns - A boolean indicating whether the password matches the hash
 */
export const compareWithSalt = async (
  password: string,
  hash: string,
  salt: string,
): Promise<boolean> => {
  const h = await hashWithSalt(password, salt);
  return h === hash;
};
