import { FastifyRequest } from "fastify";

type LogoutRequest = FastifyRequest<{
  Headers: {
    authorization: string;
  }
}>

export default LogoutRequest