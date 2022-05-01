import * as trpc from "@trpc/server";
import { Snowflake } from "nodejs-snowflake";
import validator from "validator";
import { string, z } from "zod";
import { PasswordRegex, UsernameRegex } from "./utility/regex";
import { Context, createRouter } from "./types/Context";
import Util from "./utility/services";
import * as argon2 from "argon2";
import { Meta } from "./types/interfaces/Meta";
import { TRPCClientError } from "@trpc/client";
import { TRPCError } from "@trpc/server";
import { ContentTypeParserDoneFunction } from "fastify/types/content-type-parser";
import { Flag, Flags } from "./types/Flags";
import { createContext } from "vm";
import { PrismaClientValidationError } from "@prisma/client/runtime";
import { Prisma } from "@prisma/client";

// Prisma Client
import { prisma } from "./utility/prisma";

export const appRouter = createRouter()
  .mutation("register", {
    input: z.object({
      username: z.string().min(3).max(20),
      password: z.string().min(8).max(1000),
      email: z.string().email(),

      //this is temp
      access_code: z.string().length(8),
    }),
    resolve: async ({ input }) => {
      let { username, email, password, access_code } = input;

      if (!username.match(UsernameRegex))
        return { ok: false, data: { error: "invalid_username" } };
      if (!validator.isEmail(email))
        return { ok: false, data: { error: "invalid_email" } };
      if (!password.match(PasswordRegex))
        return { ok: false, data: { error: "invalid_password" } };

      // Here will eventually be the betacode tester
      // pass by default

      try {
        const user = await prisma.user.create({
          data: {
            username,
            email,
            password: await argon2.hash(password, { type: argon2.argon2id }),
            id: new Snowflake().getUniqueID().toString(),
            flags: ["user"],
          },
        });

        return {
          ok: true,
          data: {
            ...user,
          },
        };
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2002") {
            return {
              ok: false,
              data: {
                error: "unique_constraint_validation_failure",
              },
            };
          }
        }
        throw e;
      }
    },
  })
  .mutation("login", {
    input: z.object({
      login_id: z.string(),
      password: z.string(),
    }),
    resolve: async ({ input, ctx }) => {
      let { login_id, password } = input;

      const formattedLoginID = login_id.toLowerCase();
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ email: formattedLoginID }, { username: formattedLoginID }],
        },
      });
      if (!user) return { ok: false, data: { error: "login_id_invalid" } };

      const auth = await argon2.verify(user.password, password, {
        type: argon2.argon2id,
      });
      if (!auth) return { ok: false, data: { error: "invalid_login" } };

      return Util.CreateSession(user.id, ctx.ip!);
    },
  })
  .merge(
    "user.",
    createRouter()


      .middleware(async ({ path, type, next, meta, ctx }) => {
        let authorized = true;

        if (meta?.auth.userFlags) {
          if (ctx.user) {
            for (const flag of meta?.auth.userFlags) if (!ctx.user.flags.includes(flag)) authorized = false;
          } else {
            authorized = false;
          }
        }

        if (meta?.auth.verifyIP && ctx.ip !== ctx.token?.client_ip) authorized = false;

        if (!authorized) throw new TRPCError({ code: "UNAUTHORIZED" });
        return next();
      })

      // Username
      .query("username", {
        resolve: async ({ ctx }) => {
          return ctx.user?.username;
        },
      })

      // Flags
      .query("flags", {
        resolve: async ({ ctx }) => {
          return ctx.user?.flags;
        },
      })
      .mutation("addFlags", {
        meta: { auth: { userFlags: ["admin"] } },
        input: z.object({ flags: z.array( z.string() ) }),
        resolve: async ({ ctx, input }) => {
          return await prisma.user.update({ 
            where: { id: ctx.user?.id },
            data: { flags: { push: input.flags.filter(f => Flags.includes(f)) } }
          });
        },
      })
      .mutation("removeFlags", {
        meta: { auth: { userFlags: ["admin"] } },
        input: z.object({ flags: z.array( z.string() ) }),
        resolve: async ({ ctx, input }) => {
          return await prisma.user.update({ 
            where: { id: ctx.user?.id },
            data: { flags: { 
              set: ctx.user?.flags.filter(f => !(input.flags.includes(f))) 
            }}
          });
        },
      })
  );