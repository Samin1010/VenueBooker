import "reflect-metadata";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { createServer } from "http";
import express from "express";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import cors from "cors";
import { resolvers } from "./graphql/resolver";
import { AppDataSource } from "./data-source";
import { typeDefs } from "./graphql/schema";

async function startServer() {
  // Initialize TypeORM
  await AppDataSource.initialize();
  console.log("Data Source has been initialized!");

  // Create Express app and HTTP server
  const app = express();
  const httpServer = createServer(app);

  // i configured my render application
  // under the health check section
  // as /health route in order to check the
  // health of the application
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ready" });
  });

  // Create WebSocket server
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  // Create GraphQL schema
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  // Set up WebSocket server
  const serverCleanup = useServer({ schema }, wsServer);

  // Create Apollo Server
  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  // Start the server
  await server.start();

  // Apply middleware
  app.use(
    "/graphql",
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(server),
  );

  // Start listening
  const PORT = Number(process.env.PORT) || 4000;
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}/graphql`);
  });
}

startServer().catch((err) => {
  console.error("Error starting server:", err);
});
