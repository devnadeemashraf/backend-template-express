import { Router } from "express";

/* Route Versioning */
import { PREFIX_ROUTE_V1 } from "@/core/url";

/* Routes */
import { authRoutes } from "./auth.routes";
import { userRoutes } from "./user.routes";

/* Router */
const routes: Router = Router();

routes.use(`${PREFIX_ROUTE_V1}/auth`, authRoutes);
routes.use(`${PREFIX_ROUTE_V1}/users`, userRoutes);

export { routes };
