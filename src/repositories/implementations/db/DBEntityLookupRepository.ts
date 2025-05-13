import { IEntityLookupRepository } from "@/repositories/IEntityLookupRepository";

class DBEntityLookupRepository implements IEntityLookupRepository {
  constructor() {
    // init Prisma
    // init Redis
  }

  async getFromRedis() {}
  async setToRedis() {}
  async getFromDB() {}
  async setToDB() {}
}

export default DBEntityLookupRepository;
