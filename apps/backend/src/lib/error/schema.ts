import { z } from "@hono/zod-openapi";

export const ErrorDetail = z.object({
  message: z.string().openapi({
    description: "Error message text",
  }),
  location: z.string().openapi({
    description: "Where the error occurred, e.g. 'body.items[3].tags",
  }),
  value: z.string().openapi({
    description: "The value at the given location",
  }),
});

export type ErrorDetail = z.infer<typeof ErrorDetail>;

const ContentfulStatusCode = z
  .union([
    z.literal(100),
    z.literal(102),
    z.literal(103),
    z.literal(200),
    z.literal(201),
    z.literal(202),
    z.literal(203),
    z.literal(206),
    z.literal(207),
    z.literal(208),
    z.literal(226),
    z.literal(300),
    z.literal(301),
    z.literal(302),
    z.literal(303),
    z.literal(305),
    z.literal(306),
    z.literal(307),
    z.literal(308),
    z.literal(400),
    z.literal(401),
    z.literal(402),
    z.literal(403),
    z.literal(404),
    z.literal(405),
    z.literal(406),
    z.literal(407),
    z.literal(408),
    z.literal(409),
    z.literal(410),
    z.literal(411),
    z.literal(412),
    z.literal(413),
    z.literal(414),
    z.literal(415),
    z.literal(416),
    z.literal(417),
    z.literal(418),
    z.literal(421),
    z.literal(422),
    z.literal(423),
    z.literal(424),
    z.literal(425),
    z.literal(426),
    z.literal(428),
    z.literal(429),
    z.literal(431),
    z.literal(451),
    z.literal(500),
    z.literal(501),
    z.literal(502),
    z.literal(503),
    z.literal(504),
    z.literal(505),
    z.literal(506),
    z.literal(507),
    z.literal(508),
    z.literal(510),
    z.literal(511),
  ])
  .openapi({
    description: "HTTP status code",
    examples: [400],
  });

export const ErrorModel = z.object({
  title: z.string().openapi({
    description:
      "A short, human-readable summary of the problem type. This value should not change between occurrences of the error.",
    examples: ["Bad Request"],
  }),
  status: ContentfulStatusCode,
  detail: z.string().openapi({
    description:
      "A human-readable explanation specific to this occurrence of the problem.",
    examples: ["Property foo is required but is missing."],
  }),
  errors: z.array(ErrorDetail).optional().openapi({
    description: "Optional list of individual error details.",
  }),
});

export type ErrorModel = z.infer<typeof ErrorModel>;
