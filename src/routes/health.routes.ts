import { Router } from "express";
import { createHealthCheckFactory } from "@/usecases/Health/HealthCheck/HealthCheckFactory";

const healthRoutes = Router();

healthRoutes.route("/").get((request, response) => {
  return createHealthCheckFactory().handle(request, response);
});

export { healthRoutes };
