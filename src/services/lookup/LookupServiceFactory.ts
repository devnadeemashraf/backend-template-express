/* eslint-disable @typescript-eslint/no-explicit-any */
import { User } from "prisma/generated/app-client";
import BloomFilter from "@/libs/common/BloomFilter";

/**
 * Lookup Service Implementations
 * Ex: UsernameLookupService, EmailLookupService, etc.
 */
import UsernameLookupService from "./implementations/UsernameLookupService";

/**
 * Lookup Service Blueprint Interface
 */
import { ILookupService } from "./ILookupService";

/**
 * Factory class to create instances of Lookup Services
 * This class is responsible for creating instances of Lookup Services
 * TODO: Once the Lookup Service Implementations are generic, we can utilize the same instance for multiple attributes
 */
class LookupServiceFactory {
  /**
   * Creates a UsernameLookupService instance to lookup usernames efficiently
   * @param bloomFilter BloomFilter instance
   * @param redisClient RedisClient instance
   * @param userRepository UserRepository instance
   * @returns UsernameLookupService instance
   */
  static createUsernameLookupService(
    bloomFilter: BloomFilter,
    redisClient: any,
    userRepository: any,
  ): ILookupService<User, string> {
    return new UsernameLookupService(bloomFilter, redisClient, userRepository);
  }

  /**
   * Creates a UsernameLookupService instance to lookup usernames efficiently
   * @param bloomFilter BloomFilter instance
   * @param redisClient RedisClient instance
   * @param userRepository UserRepository instance
   * @returns EmailLookupService instance
   */
  //   static createEmailLookupService(
  //     bloomFilter: BloomFilter,
  //     redisClient: any,
  //     userRepository: any,
  //   ): ILookupService<User, string> {
  //     return new EmailLookupService(bloomFilter, redisClient, userRepository);
  //   }
}

export default LookupServiceFactory;
