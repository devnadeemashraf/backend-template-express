import { PrismaClient as AppPrismaClient } from "prisma/generated/app-client";
import { PrismaClient as LogsPrismaClient } from "prisma/generated/logs-client";

// TODO: Update this file to PrismaClient class following the same pattern across the app

const appPrismaClient = new AppPrismaClient();
const logsPrismaClient = new LogsPrismaClient();

export { appPrismaClient, logsPrismaClient };
