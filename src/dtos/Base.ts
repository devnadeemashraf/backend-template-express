/**
 * Base DTO
 * It is used to define the structure of a Base object
 * It includes attributes that are common to all entities
 */
export interface IBase {
  // -------------------------
  // Primary Key
  // -------------------------
  id: string;

  // -------------------------
  // Timestamps
  // -------------------------
  created_at: Date;
  updated_at: Date;
}
