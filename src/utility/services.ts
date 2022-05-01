import { PrismaClient } from "@prisma/client";
import * as date from "date-and-time";
import { FastifyReply } from "fastify";
import * as jwt from "jsonwebtoken";
import { prisma } from "./prisma";

namespace Util {
  export async function CreateSession(user_id: string, client_ip: string) {
    if (!process.env.PRIVATE_KEY)
      throw new Error("invalid_env_PRIVATE_KEY");

    let session = await prisma.session.create({
      data: {
        user_id,
        client_app: "WEB",
        client_user_agent: "none lol",
        client_ip,
        expiry: date.addDays(new Date(), 8),
      },
    });

    await prisma.user.update({
      where: {
        id: user_id,
      },
      data: {
        sessions: {
          connect: {
            session_id: session.session_id,
          },
        },
      },
    });

    const token = jwt.sign(
      {
        session_id: session.session_id,
      },
      process.env.PRIVATE_KEY
    );

    return token;
  }
}

export default Util;
