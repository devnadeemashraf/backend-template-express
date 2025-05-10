import { HealthCheckController } from "./HealthCheckController";
import { HealthCheckUseCase } from "./HealthCheckUseCase";

export const createHealthCheckFactory = () => {
  const healthCheckUseCase = new HealthCheckUseCase();
  const healthCheckController = new HealthCheckController(healthCheckUseCase);

  return healthCheckController;
};
