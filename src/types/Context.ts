import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import * as jwt from "jsonwebtoken";
import jwtDecode from "jwt-decode";
import requestIp from "request-ip";
import { User } from "@prisma/client";
import ts, { NullLiteral } from "typescript";
import { ISafeUser } from "./interfaces/ISafeUser";
import { prisma } from "../utility/prisma";
import { IAuthToken } from "./interfaces/IAuthToken";
import { Flag } from "./Flags";
import { Meta } from "./interfaces/Meta";

// interface ContextReturn {
//   user: ISafeUser | null;
//   token: IAuthToken | null;
//   ip: string | null;
// }

// The app's context - is generated for each incoming request
export async function createContext(opts?: trpcNext.CreateNextContextOptions) {
  //@ts-ignore
  const ip = requestIp.getClientIp(opts?.req);

  if (!opts?.req.headers.authorization)
    return {
      user: null,
      ip: ip,
      token: null,
    };

  let token: IAuthToken = jwtDecode<IAuthToken>(
    opts?.req.headers.authorization
  );

  async function getUserFromHeader(): Promise<ISafeUser | null> {
    if (opts?.req.headers.authorization) {
      // const user = await decodeJwtToken(req.headers.authorization.split(' ')[1])
      let tmp = await prisma.user.findFirst({
        where: {
          id: token.user_id,
        },
      });

      return tmp;
    }

    return null;
  }

  const user = await getUserFromHeader();

  return {
    user,
    ip,
    token,
  };
}

export type Context = trpc.inferAsyncReturnType<typeof createContext>;

// Helper function to create a router with your app's context
export function createRouter() {
  return trpc.router<Context, Meta>();
}
