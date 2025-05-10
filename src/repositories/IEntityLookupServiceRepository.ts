/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IEntityLookupServiceRepository {
  get: (key: string) => Promise<any>;
  set: (key: string, payload: string, ex: string, ttl: number) => Promise<any>;
}
