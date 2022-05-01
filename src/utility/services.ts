import { PrismaClient } from "@prisma/client";
import * as date from "date-and-time";
import { FastifyReply } from "fastify";
import * as jwt from "jsonwebtoken";
import { prisma } from "./prisma";

namespace Util {
  export async function CreateSession(user_id: string, client_ip: string) {
    if (typeof process.env.PRIVATE_KEY !== "string")
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
    /*if (typeof process.env.PRIVATE_KEY === "string") {
      const data = {
        user_id,
        client_ip,
        expires: options?.rememberLogin
          ? date.addHours(new Date(), 1)
          : date.addDays(new Date(), 8),
        flags: options?.flags || ["user"],
        token: "",
      };

      const sessionToken = jwt.sign(data, process.env.PRIVATE_KEY, {
        expiresIn: options?.rememberLogin ? "1h" : "8d",
      });

      data.token = sessionToken;

      await prisma.user.update({
        where: { id: user_id },
        data: { sessions: { push: sessionToken } },
      });

      return data;
    } else throw new Error("invalid_private_key");*/
  }
}

export default Util;
