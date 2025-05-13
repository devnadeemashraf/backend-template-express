/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IEntityLookupRepository {
  getFromRedis: (key: string) => Promise<any>;

  setToRedis: (key: string, payload: string, ex: string, ttl: number) => Promise<any>;

  getFromDB: (key: string) => Promise<any>;

  setToDB: (key: string, payload: string, ex: string, ttl: number) => Promise<any>;
}
