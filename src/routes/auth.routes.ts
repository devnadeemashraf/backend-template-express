import { Router } from "express";

import { createUserFactory } from "../usecases/User/CreateUser/CreateUserFactory";
import { findAllUsersFactory } from "../usecases/User/FindAllUsers/FindAllUsersFactory";
import { findByIdUserFactory } from "../usecases/User/FindByIdUser/FindByIdUserFactory";
import { updateUserFactory } from "../usecases/User/UpdateUser/UpdateUserFactory";
import { deleteUserFactory } from "../usecases/User/DeleteUser/DeleteUserFactory";

const authRoutes = Router();

authRoutes.route("/login").post((request, response) => {
  return {};
});

authRoutes
  .route("/")
  .post((request, response) => {
    return createUserFactory().handle(request, response);
  })
  .get((request, response) => {
    return findAllUsersFactory().handle(request, response);
  });

authRoutes
  .route("/:id")
  .get((request, response) => {
    return findByIdUserFactory().handle(request, response);
  })
  .put((request, response) => {
    return updateUserFactory().handle(request, response);
  })
  .delete((request, response) => {
    return deleteUserFactory().handle(request, response);
  });

export { authRoutes };
