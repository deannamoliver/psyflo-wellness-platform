import { HTTPException } from "hono/http-exception";
import type { ErrorDetail, ErrorModel } from "./schema";

export function httpException(body: ErrorModel): never {
  throw new HTTPException(body.status, {
    message: body.detail,
    res: new Response(JSON.stringify(body), {
      headers: {
        "Content-Type": "application/json",
      },
      status: body.status,
      statusText: body.title,
    }),
  });
}

export function badRequest(detail: string, errors?: ErrorDetail[]): never {
  httpException({
    title: "Bad Request",
    status: 400,
    detail,
    errors,
  });
}

export function unauthorized(detail: string, errors?: ErrorDetail[]): never {
  httpException({
    title: "Unauthorized",
    status: 401,
    detail,
    errors,
  });
}

export function paymentRequired(detail: string, errors?: ErrorDetail[]): never {
  httpException({
    title: "Payment Required",
    status: 402,
    detail,
    errors,
  });
}

export function forbidden(detail: string, errors?: ErrorDetail[]): never {
  httpException({
    title: "Forbidden",
    status: 403,
    detail,
    errors,
  });
}

export function notFound(detail: string, errors?: ErrorDetail[]): never {
  httpException({
    title: "Not Found",
    status: 404,
    detail,
    errors,
  });
}

export function methodNotAllowed(
  detail: string,
  errors?: ErrorDetail[],
): never {
  httpException({
    title: "Method Not Allowed",
    status: 405,
    detail,
    errors,
  });
}

export function notAcceptable(detail: string, errors?: ErrorDetail[]): never {
  httpException({
    title: "Not Acceptable",
    status: 406,
    detail,
    errors,
  });
}

export function conflict(detail: string, errors?: ErrorDetail[]): never {
  httpException({
    title: "Conflict",
    status: 409,
    detail,
    errors,
  });
}

export function gone(detail: string, errors?: ErrorDetail[]): never {
  httpException({
    title: "Gone",
    status: 410,
    detail,
    errors,
  });
}

export function lengthRequired(detail: string, errors?: ErrorDetail[]): never {
  httpException({
    title: "Length Required",
    status: 411,
    detail,
    errors,
  });
}

export function preconditionFailed(
  detail: string,
  errors?: ErrorDetail[],
): never {
  httpException({
    title: "Precondition Failed",
    status: 412,
    detail,
    errors,
  });
}

export function unsupportedMediaType(
  detail: string,
  errors?: ErrorDetail[],
): never {
  httpException({
    title: "Unsupported Media Type",
    status: 415,
    detail,
    errors,
  });
}

export function unprocessableEntity(
  detail: string,
  errors?: ErrorDetail[],
): never {
  httpException({
    title: "Unprocessable Entity",
    status: 422,
    detail,
    errors,
  });
}

export function tooManyRequests(detail: string, errors?: ErrorDetail[]): never {
  httpException({
    title: "Too Many Requests",
    status: 429,
    detail,
    errors,
  });
}

export function internalServerError(
  detail: string,
  errors?: ErrorDetail[],
): never {
  httpException({
    title: "Internal Server Error",
    status: 500,
    detail,
    errors,
  });
}

export function notImplemented(detail: string, errors?: ErrorDetail[]): never {
  httpException({
    title: "Not Implemented",
    status: 501,
    detail,
    errors,
  });
}

export function badGateway(detail: string, errors?: ErrorDetail[]): never {
  httpException({
    title: "Bad Gateway",
    status: 502,
    detail,
    errors,
  });
}

export function serviceUnavailable(
  detail: string,
  errors?: ErrorDetail[],
): never {
  httpException({
    title: "Service Unavailable",
    status: 503,
    detail,
    errors,
  });
}

export function gatewayTimeout(detail: string, errors?: ErrorDetail[]): never {
  httpException({
    title: "Gateway Timeout",
    status: 504,
    detail,
    errors,
  });
}
