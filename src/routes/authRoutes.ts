/* eslint-disable @typescript-eslint/no-unused-vars */
import { Router } from "express";

import { body } from "express-validator";

const authRoutes = Router();

// TODO: Improve the Express Request Validation Rules for all routes
authRoutes
  .route("/login")
  .post(
    body("username").isString().notEmpty(),
    body("password").isString().notEmpty().isLength({ min: 6 }),
    (request, response) => {
      return {};
    },
  );

export { authRoutes };
