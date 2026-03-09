# Error Module Architecture (`src/lib/error/`)

This document provides the detailed architecture overview for the `src/lib/error/` folder.

## Overview

The `error/` module provides standardized error handling following the RFC 7807 Problem Details specification. It includes Zod schemas for error responses and typed helper functions for throwing HTTP exceptions.

## Directory Structure

```text
src/lib/error/
├── api-error.ts          # HTTP exception helpers
└── schema.ts             # ErrorModel and ErrorDetail Zod schemas
```

## Design Patterns

### RFC 7807 Problem Details

Error responses follow the Problem Details format:

```json
{
  "title": "Bad Request",
  "status": 400,
  "detail": "Property foo is required but is missing.",
  "errors": [
    {
      "message": "Required",
      "location": "body.foo",
      "value": "undefined"
    }
  ]
}
```

### Typed Error Helpers

Error functions have return type `never` to indicate they always throw:

```typescript
export function badRequest(detail: string, errors?: ErrorDetail[]): never {
  httpException({ title: "Bad Request", status: 400, detail, errors });
}
```

This enables TypeScript to understand control flow:

```typescript
if (!user) {
  notFound("User not found");  // TypeScript knows execution stops here
}
// user is narrowed to non-null here
```

### Schema Registration

`ErrorModel` is registered in the OpenAPI registry at app startup:

```typescript
app.openAPIRegistry.register("ErrorModel", ErrorModel);
```

## Available Error Helpers

| Function | Status | Description |
| -------- | ------ | ----------- |
| `badRequest` | 400 | Invalid request syntax |
| `unauthorized` | 401 | Authentication required |
| `paymentRequired` | 402 | Payment required |
| `forbidden` | 403 | Insufficient permissions |
| `notFound` | 404 | Resource not found |
| `methodNotAllowed` | 405 | HTTP method not allowed |
| `notAcceptable` | 406 | Cannot produce acceptable response |
| `conflict` | 409 | Request conflicts with current state |
| `gone` | 410 | Resource no longer available |
| `lengthRequired` | 411 | Content-Length header required |
| `preconditionFailed` | 412 | Precondition not met |
| `unsupportedMediaType` | 415 | Media type not supported |
| `unprocessableEntity` | 422 | Request semantically invalid |
| `tooManyRequests` | 429 | Rate limit exceeded |
| `internalServerError` | 500 | Server error |
| `notImplemented` | 501 | Feature not implemented |
| `badGateway` | 502 | Invalid upstream response |
| `serviceUnavailable` | 503 | Service temporarily unavailable |
| `gatewayTimeout` | 504 | Upstream timeout |

## Common Tasks

### Throwing an Error

```typescript
import { notFound, badRequest } from "@/lib/error/api-error";

// Simple error
notFound("User not found");

// Error with details
badRequest("Validation failed", [
  { message: "Required", location: "body.email", value: "undefined" },
]);
```

### Adding a New Error Type

1. Add function to `src/lib/error/api-error.ts` following the existing pattern
2. Use the `httpException()` helper with appropriate title/status
3. Update `docs/backend/lib/error/api-error.md`

### Using ErrorModel in Responses

Reference ErrorModel in route definitions for error responses:

```typescript
responses: {
  404: {
    description: "Not Found",
    content: { "application/json": { schema: ErrorModel } },
  },
},
```

## Dependencies

- `@hono/zod-openapi` - Zod integration for OpenAPI schemas
- `hono/http-exception` - HTTPException class

## Integration

The error schemas integrate with:

1. **OpenAPI docs** - ErrorModel registered for API documentation
2. **Validation hook** - `openAPIHono()` default hook returns 422 errors in this format
3. **Route handlers** - Error helpers throw consistent error responses
