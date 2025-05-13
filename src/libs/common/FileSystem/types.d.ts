/**
 * Options for file operations
 */
export interface IFileOptions {
  encoding?: BufferEncoding;
  flag?: string;
  mode?: number;
}

/**
 * Options for directory operations
 */
export interface IDirectoryOptions {
  recursive?: boolean;
  mode?: number;
}

/**
 * Options for listing directory contents
 */
export interface IListOptions {
  recursive?: boolean;
  includeDirectories?: boolean;
  includeFiles?: boolean;
  filter?: RegExp | ((name: string) => boolean);
  fullPaths?: boolean;
}

/**
 * File information structure
 */
export interface IFileInfo {
  path: string;
  name: string;
  isDirectory: boolean;
  isFile: boolean;
  size: number;
  created: Date;
  modified: Date;
  accessed: Date;
}
