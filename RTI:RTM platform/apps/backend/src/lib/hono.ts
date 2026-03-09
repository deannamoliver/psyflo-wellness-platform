import { OpenAPIHono } from "@hono/zod-openapi";
import type { ErrorModel } from "./error/schema";

export function openAPIHono(basePath: string) {
  return new OpenAPIHono({
    defaultHook: (result, c) => {
      if (!result.success) {
        return c.json(
          {
            title: "UnprocessableEntity",
            status: 422,
            detail: result.error.message,
            errors: result.error.issues.map((issue) => ({
              message: issue.message,
              location: issue.path.join("."),
              value: issue.input?.toString?.() ?? "unknown",
            })),
          } satisfies ErrorModel,
          422,
        );
      }
    },
  }).basePath(basePath);
}
