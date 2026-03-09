import { Scalar } from "@scalar/hono-api-reference";
import { ErrorModel } from "@/lib/error/schema";
import { openAPIHono } from "@/lib/hono";
import usersService from "./users/service";

const app = openAPIHono("/api");

app.openAPIRegistry.register("ErrorModel", ErrorModel);

app.doc("/docs/json", {
  openapi: "3.0.0",
  info: {
    title: "feelwell API",
    version: "0.1.0",
  },
});

app.get("/docs", Scalar({ url: "/api/docs/json" }));

app.route("/", usersService);

export default {
  port: 8000,
  fetch: app.fetch,
};
