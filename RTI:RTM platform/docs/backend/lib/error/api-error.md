# `src/lib/error/api-error.ts`

HTTP exception helper functions that throw Hono HTTPException with RFC 7807 Problem Details format. All functions have return type `never` for proper TypeScript control flow. Includes helpers for common HTTP errors: badRequest (400), unauthorized (401), paymentRequired (402), forbidden (403), notFound (404), methodNotAllowed (405), notAcceptable (406), conflict (409), gone (410), lengthRequired (411), preconditionFailed (412), unsupportedMediaType (415), unprocessableEntity (422), tooManyRequests (429), internalServerError (500), notImplemented (501), badGateway (502), serviceUnavailable (503), gatewayTimeout (504).

**Exports:** `httpException()`, `badRequest()`, `unauthorized()`, `paymentRequired()`, `forbidden()`, `notFound()`, `methodNotAllowed()`, `notAcceptable()`, `conflict()`, `gone()`, `lengthRequired()`, `preconditionFailed()`, `unsupportedMediaType()`, `unprocessableEntity()`, `tooManyRequests()`, `internalServerError()`, `notImplemented()`, `badGateway()`, `serviceUnavailable()`, `gatewayTimeout()`

**Dependencies:** `hono/http-exception`, `./schema`
