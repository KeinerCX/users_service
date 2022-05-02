import { PrismaClient, User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import * as date from "date-and-time";
import { FastifyReply } from "fastify";
import * as jwt from "jsonwebtoken";
import { ISafeUser } from "../types/interfaces/ISafeUser";
import { prisma } from "./prisma";

namespace Util {
  export async function CreateSession(user_id: string, client_ip: string) {
    if (!process.env.PRIVATE_KEY) throw new Error("invalid_env_PRIVATE_KEY");

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

  export async function GetQueryUser(
    ctx: { user: ISafeUser | null },
    input: string
  ) {
    if (input) {
      const quser = await prisma.user.findUnique({ where: { id: input } });
      if (!quser) throw new TRPCError({ code: "BAD_REQUEST" });
      return quser;
    } else return ctx.user;
  }
}

export default Util;
