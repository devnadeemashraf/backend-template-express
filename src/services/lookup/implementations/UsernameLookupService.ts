/* eslint-disable @typescript-eslint/no-explicit-any */
import { User } from "prisma/generated/app-client";

import BloomFilter from "@/libs/common/BloomFilter";

import AbstractMultiLayerLookupService from "@/services/lookup/AbstractMultiLayerLookupService";

/**
 * TODO: Update redisClient type
 * TODO: Update userRepository type
 * TODO: Improve the Lookup Service
 * TODO: Try to make it a generic class that can be used for - username & email both and possibly other attributes of other entities too
 */
class UsernameLookupService extends AbstractMultiLayerLookupService<User, string> {
  private readonly KEY_PREFIX = "username:";
  private readonly CACHE_TTL = 12 * 3600; // 12 hours

  private bloomFilter: BloomFilter;
  private redisClient: any;
  private userRepository: any;

  constructor(bloomFilter: BloomFilter, redisClient: any, userRepository: any) {
    super();

    this.bloomFilter = bloomFilter;
    this.redisClient = redisClient;
    this.userRepository = userRepository;
  }

  protected async existsInBloomFilter(username: string): Promise<boolean> {
    return this.bloomFilter.has(username);
  }

  protected async getFromCache(username: string): Promise<User | null> {
    const userData = await this.redisClient.get(`${this.KEY_PREFIX}${username}`);
    return userData ? JSON.parse(userData) : null;
  }

  protected async existsInStore(username: string): Promise<boolean> {
    return await this.userRepository.existsByUsername(username);
  }

  protected async getFromStore<T>(username: string): Promise<T | null> {
    return await this.userRepository.findByUsername(username);
  }

  protected async addToStore<T>(username: string, user: T): Promise<void> {
    await this.userRepository.save(username, user);
  }

  protected async addToCache(username: string, user: User): Promise<void> {
    await this.redisClient.set(
      `${this.KEY_PREFIX}${username}`,
      JSON.stringify(user),
      "EX",
      this.CACHE_TTL,
    );
  }

  protected async addToBloomFilter(username: string): Promise<void> {
    this.bloomFilter.add(username);
    return;
  }

  protected async removeFromCache(username: string): Promise<void> {
    await this.redisClient.del(`${this.KEY_PREFIX}${username}`);
    return;
  }
}

export default UsernameLookupService;
