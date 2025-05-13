import path from "path";
import fs from "fs/promises";
import { createReadStream, createWriteStream } from "fs";
import { Readable } from "stream";
import { pipeline } from "stream/promises";

import { AppError } from "@/libs/AppError";

import { IDirectoryOptions, IFileInfo, IFileOptions, IListOptions } from "./types";
import { isProduction } from "@/utils/common";

class FileSystem {
  /**
   * Checks if a file exists at the given path
   * @param filePath - Path to check
   * @returns Promise resolving to True if the file exists, False otherwise
   */
  static async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gets information about a file or directory
   * @param filePath - Path to check
   * @returns Promise resolving to file information
   */
  static async getInfo(filePath: string): Promise<IFileInfo> {
    try {
      const stats = await fs.stat(filePath);
      return {
        path: filePath,
        name: path.basename(filePath),
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile(),
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        accessed: stats.atime,
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        throw new AppError("NOT_FOUND", `Path not found: ${filePath}`);
      }
      throw new AppError("NOT_FOUND", `Error getting info for: ${filePath}`);
    }
  }

  /**
   * Creates a directory if it doesn't exist
   * @param dirPath - Directory path to create
   * @param options - Directory creation options
   * @returns Promise resolving when directory exists or has been created
   */
  static async ensureDir(
    dirPath: string,
    options: IDirectoryOptions = { recursive: true },
  ): Promise<void> {
    try {
      if (await this.exists(dirPath)) {
        const info = await this.getInfo(dirPath);
        if (!info.isDirectory) {
          throw new AppError("NOT_FOUND", `Path exists but is not a directory: ${dirPath}`);
        }
        return;
      }

      await fs.mkdir(dirPath, options);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("NOT_FOUND", `Failed to create directory: ${dirPath}`);
    }
  }

  /**
   * Reads a file's contents
   * @param filePath - Path to the file
   * @param options - File reading options
   * @returns Promise resolving to file contents
   */
  static async readFile(
    filePath: string,
    options: IFileOptions = { encoding: "utf8" },
  ): Promise<string | Buffer> {
    try {
      await this.ensureFileExists(filePath);
      return await fs.readFile(filePath, options);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("NOT_FOUND", `Failed to read file: ${filePath}`);
    }
  }

  /**
   * Writes content to a file, creating parent directories if needed
   * @param filePath - Path to the file
   * @param data - Data to write
   * @param options - File writing options
   * @returns Promise resolving when file is written
   */
  static async writeFile(
    filePath: string,
    data: string | Buffer | Uint8Array,
    options: IFileOptions = {},
  ): Promise<void> {
    try {
      await this.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, data, options);
    } catch (error) {
      throw new AppError(
        "NOT_FOUND",
        `Failed to write file: ${filePath} - ${(error as AppError).message}`,
      );
    }
  }

  /**
   * Appends content to a file, creating the file and parent directories if needed
   * @param filePath - Path to the file
   * @param data - Data to append
   * @param options - File appending options
   * @returns Promise resolving when data is appended
   */
  static async appendFile(
    filePath: string,
    data: string | Buffer | Uint8Array,
    options: IFileOptions = {},
  ): Promise<void> {
    try {
      await this.ensureDir(path.dirname(filePath));
      await fs.appendFile(filePath, data, options);
    } catch (error) {
      throw new AppError(
        "NOT_FOUND",
        `Failed to append to file: ${filePath} - ${(error as AppError).message}`,
      );
    }
  }

  /**
   * Copies a file from source to destination
   * @param src - Source file path
   * @param dest - Destination file path
   * @param overwrite - Whether to overwrite existing destination
   * @returns Promise resolving when file is copied
   */
  static async copyFile(src: string, dest: string, overwrite = false): Promise<void> {
    try {
      await this.ensureFileExists(src);
      await this.ensureDir(path.dirname(dest));

      if (!overwrite && (await this.exists(dest))) {
        throw new AppError("CONFLICT", `Destination file already exists: ${dest}`);
      }

      await fs.copyFile(src, dest);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("NOT_FOUND", `Failed to copy file from ${src} to ${dest}`);
    }
  }

  /**
   * Moves a file from source to destination
   * @param src - Source file path
   * @param dest - Destination file path
   * @param overwrite - Whether to overwrite existing destination
   * @returns Promise resolving when file is moved
   */
  static async moveFile(src: string, dest: string, overwrite = false): Promise<void> {
    try {
      await this.ensureFileExists(src);
      await this.ensureDir(path.dirname(dest));

      if (!overwrite && (await this.exists(dest))) {
        throw new AppError("CONFLICT", `Destination file already exists: ${dest}`);
      }

      await fs.rename(src, dest);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("NOT_FOUND", `Failed to move file from ${src} to ${dest}`);
    }
  }

  /**
   * Deletes a file if it exists
   * @param filePath - Path to the file
   * @returns Promise resolving to true if file was deleted, false if it didn't exist
   */
  static async deleteFile(filePath: string): Promise<boolean> {
    try {
      if (!(await this.exists(filePath))) {
        return false;
      }

      const info = await this.getInfo(filePath);
      if (info.isDirectory) {
        throw new AppError("NOT_FOUND", `Cannot delete directory with deleteFile: ${filePath}`);
      }

      await fs.unlink(filePath);
      return true;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("NOT_FOUND", `Failed to delete file: ${filePath}`);
    }
  }

  /**
   * Copies a directory recursively
   * @param src - Source directory path
   * @param dest - Destination directory path
   * @param overwrite - Whether to overwrite existing files
   * @returns Promise resolving when directory is copied
   */
  static async copyDir(src: string, dest: string, overwrite = false): Promise<void> {
    try {
      await this.ensureDirExists(src);
      await this.ensureDir(dest);

      const entries = await fs.readdir(src, { withFileTypes: true });

      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
          await this.copyDir(srcPath, destPath, overwrite);
        } else {
          await this.copyFile(srcPath, destPath, overwrite);
        }
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("NOT_FOUND", `Failed to copy directory from ${src} to ${dest}`);
    }
  }

  /**
   * Moves a directory
   * @param src - Source directory path
   * @param dest - Destination directory path
   * @param overwrite - Whether to overwrite existing files
   * @returns Promise resolving when directory is moved
   */
  static async moveDir(src: string, dest: string, overwrite = false): Promise<void> {
    try {
      await this.ensureDirExists(src);

      // If destination doesn't exist or overwrite is true, try direct rename
      if (!(await this.exists(dest)) || overwrite) {
        try {
          await this.ensureDir(path.dirname(dest));
          await fs.rename(src, dest);
          return;
        } catch (moveError) {
          // If rename fails (e.g., across devices), fall back to copy and delete
          if ((moveError as NodeJS.ErrnoException).code === "EXDEV") {
            await this.copyDir(src, dest, overwrite);
            await this.deleteDir(src);
            return;
          }
          throw moveError;
        }
      }

      // If destination exists and overwrite is false
      throw new AppError("CONFLICT", `Destination directory already exists: ${dest}`);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("NOT_FOUND", `Failed to move directory from ${src} to ${dest}`);
    }
  }

  /**
   * Deletes a directory and its contents
   * @param dirPath - Path to the directory
   * @param options - Directory deletion options
   * @returns Promise resolving to true if directory was deleted, false if it didn't exist
   */
  static async deleteDir(
    dirPath: string,
    options: { recursive: true } = { recursive: true },
  ): Promise<boolean> {
    try {
      if (!(await this.exists(dirPath))) {
        return false;
      }

      const info = await this.getInfo(dirPath);
      if (!info.isDirectory) {
        throw new AppError("NOT_FOUND", `Path is not a directory: ${dirPath}`);
      }

      await fs.rm(dirPath, options);
      return true;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("NOT_FOUND", `Failed to delete directory: ${dirPath}`);
    }
  }

  /**
   * Lists directory contents
   * @param dirPath - Path to the directory
   * @param options - Listing options
   * @returns Promise resolving to array of file/directory paths or names
   */
  static async listDir(dirPath: string, options: IListOptions = {}): Promise<string[]> {
    const {
      recursive = false,
      includeDirectories = true,
      includeFiles = true,
      filter,
      fullPaths = true,
    } = options;

    try {
      await this.ensureDirExists(dirPath);
      let result: string[] = [];

      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const entryName = fullPaths ? fullPath : entry.name;

        // Apply filter if provided
        if (filter) {
          const matches = filter instanceof RegExp ? filter.test(entry.name) : filter(entry.name);

          if (!matches) continue;
        }

        if (entry.isDirectory()) {
          if (includeDirectories) {
            result.push(entryName);
          }

          if (recursive) {
            const subEntries = await this.listDir(fullPath, {
              ...options,
              fullPaths,
            });
            result = result.concat(subEntries);
          }
        } else if (entry.isFile() && includeFiles) {
          result.push(entryName);
        }
      }

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("NOT_FOUND", `Failed to list directory: ${dirPath}`);
    }
  }

  /**
   * Streams a file from source to destination with proper error handling
   * @param src - Source file path or readable stream
   * @param dest - Destination file path or writable stream
   * @returns Promise resolving when streaming is complete
   */
  static async streamFile(
    src: string | Readable,
    dest: string | NodeJS.WritableStream,
  ): Promise<void> {
    // Initialize with proper types that have destroy() method
    let sourceStream: Readable | undefined;
    // Use a type that definitely has destroy()
    let destStream: (NodeJS.WritableStream & { destroy?: () => void }) | undefined;
    const createdStreams: Array<"source" | "dest"> = [];

    try {
      // Setup source stream
      if (typeof src === "string") {
        await this.ensureFileExists(src);
        sourceStream = createReadStream(src);
        createdStreams.push("source");
      } else {
        sourceStream = src;
      }

      // Setup destination stream
      if (typeof dest === "string") {
        await this.ensureDir(path.dirname(dest));
        destStream = createWriteStream(dest);
        createdStreams.push("dest");
      } else {
        destStream = dest;
      }

      // Perform streaming
      await pipeline(sourceStream, destStream);
    } catch (error) {
      throw new AppError("NOT_FOUND", "Failed to stream file - " + (error as AppError).message);
    } finally {
      // Clean up streams we created if an error occurred
      for (const stream of createdStreams) {
        if (stream === "source" && sourceStream && typeof src === "string") {
          sourceStream.destroy();
        } else if (
          stream === "dest" &&
          destStream &&
          typeof dest === "string" &&
          destStream.destroy
        ) {
          // Add null check for destroy method
          destStream.destroy();
        }
      }
    }
  }

  /**
   * Creates a temporary file with random name
   * @param dirPath - Directory to create temp file in (defaults to OS temp dir)
   * @param prefix - Prefix for the temp file name
   * @param suffix - Suffix for the temp file name
   * @returns Promise resolving to the temp file path
   */
  static async createTempFile(dirPath?: string, prefix = "tmp-", suffix = ""): Promise<string> {
    try {
      const tmpDir = dirPath || path.join(process.env.TEMP || "/tmp");
      await this.ensureDir(tmpDir);

      const randomStr = Math.random().toString(36).substring(2, 10);
      const timestamp = Date.now();
      const fileName = `${prefix}${timestamp}-${randomStr}${suffix}`;
      const filePath = path.join(tmpDir, fileName);

      // Touch the file to create it
      await fs.writeFile(filePath, "");

      return filePath;
    } catch (error) {
      throw new AppError(
        "NOT_FOUND",
        "Failed to create temporary file - " + (error as AppError).message,
      );
    }
  }

  /**
   * Creates a temporary directory with random name
   * @param parentDir - Parent directory to create temp dir in (defaults to OS temp dir)
   * @param prefix - Prefix for the temp dir name
   * @returns Promise resolving to the temp directory path
   */
  static async createTempDir(parentDir?: string, prefix = "tmp-dir-"): Promise<string> {
    try {
      const baseDir = parentDir || path.join(process.env.TEMP || "/tmp");
      await this.ensureDir(baseDir);

      const randomStr = Math.random().toString(36).substring(2, 10);
      const timestamp = Date.now();
      const dirName = `${prefix}${timestamp}-${randomStr}`;
      const dirPath = path.join(baseDir, dirName);

      await fs.mkdir(dirPath);

      return dirPath;
    } catch (error) {
      throw new AppError(
        "NOT_FOUND",
        "Failed to create temporary directory - " + (error as AppError).message,
      );
    }
  }

  /**
   * Gets file size in bytes
   * @param filePath - Path to the file
   * @returns Promise resolving to file size in bytes
   */
  static async getFileSize(filePath: string): Promise<number> {
    try {
      const stats = await fs.stat(filePath);
      if (!stats.isFile()) {
        throw new AppError("NOT_FOUND", `Path is not a file: ${filePath}`);
      }
      return stats.size;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        throw new AppError("NOT_FOUND", `File not found: ${filePath}`);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("NOT_FOUND", `Failed to get file size: ${filePath}`);
    }
  }

  /**
   * Ensures a file exists, throwing a specific error if not
   * @param filePath - Path to verify
   * @returns Promise resolving when verification is complete
   */
  private static async ensureFileExists(filePath: string): Promise<void> {
    try {
      const exists = await this.exists(filePath);
      if (!exists) {
        throw new AppError("NOT_FOUND", `File not found: ${filePath}`);
      }

      const stats = await fs.stat(filePath);
      if (!stats.isFile()) {
        throw new AppError("NOT_FOUND", `Path exists but is not a file: ${filePath}`);
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("NOT_FOUND");
    }
  }

  /**
   * Ensures a directory exists, throwing a specific error if not
   * @param dirPath - Path to verify
   * @returns Promise resolving when verification is complete
   */
  private static async ensureDirExists(dirPath: string): Promise<void> {
    try {
      const exists = await this.exists(dirPath);
      if (!exists) {
        throw new AppError("NOT_FOUND", `Directory not found: ${dirPath}`);
      }

      const stats = await fs.stat(dirPath);
      if (!stats.isDirectory()) {
        throw new AppError("NOT_FOUND", `Path exists but is not a directory: ${dirPath}`);
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("NOT_FOUND");
    }
  }

  /**
   * Changes file permissions
   * @param filePath - Path to the file
   * @param mode - Permissions mode (octal number)
   * @returns Promise resolving when permissions are changed
   */
  static async chmod(filePath: string, mode: number): Promise<void> {
    try {
      await this.exists(filePath);
      await fs.chmod(filePath, mode);
    } catch (error) {
      throw new AppError(
        "NOT_FOUND",
        `Failed to change permissions: ${filePath} - ${(error as AppError).message}`,
      );
    }
  }

  /**
   * Gets absolute, normalized path
   * @param relativePath - Relative path to resolve
   * @param basePath - Base path to resolve from (defaults to current directory)
   * @returns Absolute path
   */
  static resolvePath(relativePath: string, basePath = process.cwd()): string {
    return path.resolve(basePath, relativePath);
  }

  /**
   * Joins path segments
   * @param resolveFrom - Path to resolve from ("root" or "current_module")
   * @param paths - Path segments to join
   * @returns Joined path
   */
  static joinPaths(resolveFrom: "root" | "current_module", ...paths: string[]): string {
    return path.join(resolveFrom == "root" ? process.cwd() : __dirname, ...paths);
  }

  /**
   * Gets the file extension
   * @param filePath - Path to analyze
   * @returns File extension (with dot) or empty string if none
   */
  static getExtension(filePath: string): string {
    return path.extname(filePath);
  }

  /**
   * Gets file or directory name from path
   * @param filePath - Path to analyze
   * @param keepExtension - Whether to keep the extension
   * @returns Filename or directory name
   */
  static getBasename(filePath: string, keepExtension = true): string {
    if (keepExtension) {
      return path.basename(filePath);
    }
    return path.basename(filePath, path.extname(filePath));
  }

  /**
   * Gets parent directory path
   * @param filePath - Path to analyze
   * @returns Parent directory path
   */
  static getDirname(filePath: string): string {
    return path.dirname(filePath);
  }

  /**
   * Gets the file extension based on the current environment
   * @description Should be used for JS and TS files ONLY
   * @returns The Appropriate file extension based of current environment
   */
  static getApptFileExtension(): string {
    return isProduction() ? ".js" : ".ts";
  }
}

export default FileSystem;
