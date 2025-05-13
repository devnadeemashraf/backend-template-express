import { Router } from "express";

/* Route Versioning */
import { PREFIX_ROUTE_V1 } from "@/core/url";

/* Routes */
import { healthRoutes } from "./healthRoutes";
import { authRoutes } from "./authRoutes";
import { userRoutes } from "./userRoutes";

/* Router */
const routes: Router = Router();

routes.use(`${PREFIX_ROUTE_V1}/health`, healthRoutes);
routes.use(`${PREFIX_ROUTE_V1}/auth`, authRoutes);
routes.use(`${PREFIX_ROUTE_V1}/users`, userRoutes);

export { routes };
