import { PrismaClient as AppPrismaClient } from "../../prisma/generated/app-client";
import { PrismaClient as LogsPrismaClient } from "../../prisma/generated/logs-client";

const appPrismaClient = new AppPrismaClient();
const logsPrismaClient = new LogsPrismaClient();

export { appPrismaClient, logsPrismaClient };
