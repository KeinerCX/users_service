import { FastifyRequest } from "fastify";

type CreateRequest = FastifyRequest<{
  Body: {
    username: string;
    email: string;
    password: string;
    beta_code: string;
  }
}>

export default CreateRequest