import { AppError } from "@/libs/AppError";

import { IHealthCheckUseCaseResponse } from "./HealthCheckTypes";

export class HealthCheckUseCase {
  constructor() {
    // Constructor logic if needed
  }

  // TODO: Finish Health Check Logic for all the services
  async execute(): Promise<IHealthCheckUseCaseResponse> {
    if (!(await this.checkDatabaseConnection())) {
      throw new AppError("SERVICE_UNAVAILABLE", "Database Service Down", false);
    }

    if (!(await this.checkCacheConnection())) {
      throw new AppError("SERVICE_UNAVAILABLE", "Cache Service Down", false);
    }

    return {
      status: "OK",
      message: "Server Up and Running 🚀",
      currentTime: new Date().toISOString(),
    };
  }

  private async checkDatabaseConnection(): Promise<boolean> {
    // Add logic to check database connection
    return true;
  }

  private async checkCacheConnection(): Promise<boolean> {
    // Add logic to check cache connection
    return true;
  }
}
