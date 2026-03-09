# @feelwell/frontend

feelwell dashboard built with [Next.js](https://nextjs.org/).

## Prerequisites

- [Bun](https://bun.sh/): Package manager
- [Docker](https://www.docker.com/): Build container images
- [Node.js](https://nodejs.org/en): Runtime (min version: 18.8)

## Environment Variables

- `NEXT_PUBLIC_BACKEND_HOST`: Specifies the backend server's host and port that the frontend will connect to. Defaults to `localhost:8000`.

- `NEXT_PUBLIC_NO_HTTPS`: When set to true, this variable indicates that the application should not use HTTPS for backend connections. Defaults to `false`.

- `SESSION_PASSWORD`: A secure 32-character random string used by `iron-session` library for encrypting session data. It is critical to generate a strong password for production environments.
