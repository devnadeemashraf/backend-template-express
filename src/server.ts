import express from "express";
import morgan from "morgan";
import cors from "cors";

import { routes } from "./routes";

const server = express();
server.use(express.json());
server.use(cors());
server.use(express.urlencoded({ extended: true }));
server.use(morgan("dev"));
server.use(routes);

// Add in Erro handler Here
// server.use(ErrorInternal);

export { server };
