import { authUsers } from "@feelwell/database";
import { createRoute, z } from "@hono/zod-openapi";
import { UserDto } from "@/app/users/schema";
import selfService from "@/app/users/self/service";
import { authUserMiddleware } from "@/lib/auth/user-middleware";
import { db } from "@/lib/database";
import { openAPIHono } from "@/lib/hono";

const service = openAPIHono("/users");

service.openAPIRegistry.register("User", UserDto);

service.openapi(
  createRoute({
    method: "get",
    path: "/",
    middleware: authUserMiddleware,
    responses: {
      200: {
        description: "Users",
        content: {
          "application/json": {
            schema: z.object({
              users: z.array(UserDto),
            }),
          },
        },
      },
    },
  }),
  async (c) => {
    const data = await db.select().from(authUsers);

    return c.json({
      users: data,
    });
  },
);

service.route("/", selfService);

export default service;
