import { FastifyRequest } from "fastify";

type LoginRequest = FastifyRequest<{
  Body: {
    login_id: string;
    password: string;
  }
}>

export default LoginRequest