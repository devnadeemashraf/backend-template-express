import { bootstrap } from "./bootstrap";

import { server } from "./server";

// TODO: Move the Prisma Connection to Bootstrap
// import { prismaClient } from "./libs/PrismaClient";

import { PORT } from "./core/config";

// Boostrap the Application before starting the server
// This will initialize the logger, set up the database connection etc.
bootstrap();

server.listen(PORT || 3333, () => {
  logger.info(`Starting Server`);
  // prismaClient
  //   .$connect()
  //   .then(() => {
  //     logger.info(`Server Running on PORT ${PORT}`);
  //   })
  //   .catch((err: unknown) => {
  //     logger.error(`Error: ${err}`);
  //     prismaClient.$disconnect();
  //     process.exit(1);
  //   });
});
