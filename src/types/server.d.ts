/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IServerResponse {
  status: "success" | "error";
  message: string;
  data?: any;
}

export interface IPaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
