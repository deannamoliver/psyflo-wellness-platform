import { createRoute } from "@hono/zod-openapi";
import { UserDto } from "@/app/users/schema";
import { authUserMiddleware } from "@/lib/auth/user-middleware";
import { openAPIHono } from "@/lib/hono";
import { dateOrNull } from "@/lib/time-utils";

const service = openAPIHono("/self");

service.openapi(
  createRoute({
    method: "get",
    path: "/",
    middleware: authUserMiddleware,
    responses: {
      200: {
        description: "User",
        content: {
          "application/json": {
            schema: UserDto,
          },
        },
      },
    },
  }),
  (c) => {
    const user = c.get("user");

    return c.json({
      id: user.id,
      email: user.email ?? null,
      phone: user.phone ?? null,
      createdAt: dateOrNull(user.created_at),
      updatedAt: dateOrNull(user.updated_at),
    });
  },
);

export default service;
