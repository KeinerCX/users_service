import fastify from "fastify";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { appRouter } from "./router";
import { createContext } from "./types/Context";

const server = fastify({
  maxParamLength: 5000,
});

//@ts-ignore
server.register(fastifyTRPCPlugin, {
  prefix: "/",
  trpcOptions: { router: appRouter, createContext },
});

server.listen(3000, "0.0.0.0");
