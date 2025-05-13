/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Options for transforming entities to DTOs
 */
export interface ITransformOptions {
  /** Fields to exclude from the resulting DTO */
  exclude?: (string | number | symbol)[];

  /** Fields to include in the resulting DTO (if specified, only these fields will be included) */
  include?: (string | number | symbol)[];

  /** Custom transformations to apply to specific fields */
  transform?: Record<string, (value: any) => any>;
}
