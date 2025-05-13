/* eslint-disable @typescript-eslint/no-explicit-any */

import { DEFAULT_SENSITIVE_FIELDS } from "@/core/dto";
import { AppError } from "@/libs/common/AppError";

import { ITransformOptions } from "./types";

/**
 * Transforms an entity or array of entities into DTOs by removing sensitive data
 *
 * @param entity - The entity or entities to transform
 * @param options - Transformation options
 * @returns The transformed DTO(s)
 */
export function toDTO<T, D = Omit<T, (typeof DEFAULT_SENSITIVE_FIELDS)[number]>>(
  entity: T | T[] | null | undefined,
  options: ITransformOptions = {},
): D | D[] | null {
  if (entity === null || entity === undefined) {
    return null;
  }

  // Handle a List of entities
  if (Array.isArray(entity)) {
    return entity.map(item => transformSingleEntity<T, D>(item, options)) as D[];
  }

  // Otherwise, handle single entity
  return transformSingleEntity<T, D>(entity, options);
}

/**
 * Transform a single entity into a DTO
 * @param entity - Entity to transform
 * @param options - Transformation options
 * @returns Transformed DTO
 */
function transformSingleEntity<T, D>(entity: T, options: ITransformOptions): D {
  try {
    const { exclude = DEFAULT_SENSITIVE_FIELDS, include, transform = {} } = options;

    // Start with a clean object
    const dto: Record<string, any> = {};

    // Get all Enumerable property names from the Entity
    const allKeys = Object.keys(entity as Record<string, any>);

    // Determine which keys to process
    const keysToProcess = include
      ? allKeys.filter(key => include.includes(key))
      : allKeys.filter(key => !exclude.includes(key));

    // Process each key
    for (const key of keysToProcess) {
      const value = (entity as Record<string, any>)[key];

      // Apply custom transformation if provided
      if (transform[key]) {
        dto[key] = transform[key](value);
      }
      // Handle nested objects (could be another entity)
      else if (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        !(value instanceof Date)
      ) {
        dto[key] = toDTO(value, options);
      }
      // Handle arrays (could contain entities)
      else if (Array.isArray(value)) {
        dto[key] = value.map(item =>
          item !== null && typeof item === "object" ? toDTO(item, options) : item,
        );
      }
      // Use value as is
      else {
        dto[key] = value;
      }
    }

    return dto as D;
  } catch (error) {
    throw new AppError(
      "INTERNAL_SERVER_ERROR",
      `Failed to transform entity to DTO: ${(error as Error).message}`,
    );
  }
}

/**
 * Creates a strongly-typed DTO transformer function for a specific Prisma model
 *
 * @param modelName - Name of the model for debugging purposes
 * @param options - Transformation options
 * @returns A function that transforms entities to DTOs with proper typing
 * 
 * @example
    const toUserDTO = createPrismaDTO<User>('User', {
      extraExclude: ['secretNote'] as const
    });
 */
export function createPrismaDTO<
  T,
  ExcludeFields extends keyof T = never,
  IncludeFields extends keyof T = never,
>(
  modelName: string,
  options: ITransformOptions & {
    extraExclude?: ExcludeFields[];
    onlyInclude?: IncludeFields[];
  } = {},
) {
  // Define the resulting type based on options
  type ResultDTO = IncludeFields extends never
    ? Omit<T, ExcludeFields | (typeof DEFAULT_SENSITIVE_FIELDS)[number]>
    : Pick<T, IncludeFields>;

  const transformer = (
    entity: T | T[] | null | undefined,
    runtimeOptions: ITransformOptions = {},
  ): ResultDTO | ResultDTO[] | null => {
    const mergedOptions: ITransformOptions = {
      exclude: [
        ...(options.exclude || []),
        ...(options.extraExclude || []),
        ...(runtimeOptions.exclude || []),
      ],
      include: options.onlyInclude || runtimeOptions.include,
      transform: {
        ...(options.transform || {}),
        ...(runtimeOptions.transform || {}),
      },
    };

    return toDTO<T, ResultDTO>(entity, mergedOptions);
  };

  // Add metadata for debugging
  Object.defineProperty(transformer, "name", {
    value: `${modelName}DTOTransformer`,
    configurable: true,
  });

  return transformer;
}

/**
 * Creates a typed DTO transformer function for a specific entity type
 *
 * @param defaultOptions - Default transformation options for this entity type
 * @returns A function that transforms entities to DTOs with proper typing
 */
export function createDTOTransformer<T, D = Omit<T, (typeof DEFAULT_SENSITIVE_FIELDS)[number]>>(
  defaultOptions: ITransformOptions = {},
) {
  return (entity: T | T[] | null | undefined, options: ITransformOptions = {}): D | D[] | null => {
    // Merge default options with provided options
    const mergedOptions: ITransformOptions = {
      exclude: [...(defaultOptions.exclude || []), ...(options.exclude || [])],
      include: options.include || defaultOptions.include,
      transform: { ...(defaultOptions.transform || {}), ...(options.transform || {}) },
    };

    return toDTO<T, D>(entity, mergedOptions);
  };
}
