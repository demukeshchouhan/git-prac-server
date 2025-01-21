import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware as apolloMiddleware } from "@apollo/server/express4";
import { createServer as createHttpServer } from "node:http";
import { WebSocketServer } from "ws";
import { useServer as useWsServer } from "graphql-ws/use/ws";
import { makeExecutableSchema } from "@graphql-tools/schema";

import typeDefs from "./schema.js";
import { authMiddleware, decodeToken, handleLogin } from "./auth.js";
import { resolvers } from "./resolvers.js";
import { getUser } from "../db/users.js";
import { createCompanyLoader } from "../db/companies.js";

async function getContext({ req }) {
  const companyLoader = createCompanyLoader();
  const context: {
    companyLoader: ReturnType<typeof createCompanyLoader>;
    user?: {
      id: string;
      companyId: string;
      email: string;
      password: string;
      username: string;
    };
  } = { companyLoader };
  if (req.auth) {
    const user = await getUser(req.auth.sub);
    context.user = user;
  }
  return context;
}

function getWsContext({ connectionParams }) {
  const accessToken = connectionParams?.accessToken;
  if (accessToken) {
    const payload = decodeToken(accessToken);
    return { user: payload.sub };
  }
  return {};
}

const PORT = 9000;
const app = express();

app.use(cors(), express.json());
app.post("/login", handleLogin);

// const typeDefs = readFileSync("./schema.graphql", "utf8");
const schema = makeExecutableSchema({ typeDefs, resolvers });

const apolloServer = new ApolloServer({ schema });
await apolloServer.start();
app.use(
  "/graphql",
  authMiddleware,
  apolloMiddleware(apolloServer, { context: getContext })
);

const httpServer = createHttpServer(app);
const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});
useWsServer({ schema, context: getWsContext }, wsServer);

httpServer.listen({ port: PORT }, () => {
  console.log(`Server ready at http://localhost:${PORT}/graphql`);
  console.log(`WebSocket ready at ws://localhost:${PORT}/graphql`);
});
