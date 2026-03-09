# feelwell-monorepo 

This monorepo houses the frontend, backend applications and library packages for feelwell.

## Structure

The repository is setup using [turborepo](https://turbo.build/repo) for managing monorepo.

### Applications

- **[Frontend](./apps/frontend/README.md)**: React-based frontend application built with [Next.js](https://nextjs.org/).
- **[Backend](./apps/backend/README.md)**: Bun-based backend application built with [Hono](https://hono.dev/).

## Prerequisites

- [Bun](https://bun.sh/): Package manager and runtime for the backend (min version: 1.2)
- [Node.js](https://nodejs.org/en): Runtime for the frontend (min version: 18.8)
- [Docker](https://www.docker.com/): Build container images and run a Postgres instance for development
- [Supabase CLI](https://supabase.com/docs/guides/local-development): Required for local database development

## Setup

1. Clone the repository

   ```bash
   git clone git@github.com:hellopsyflo/feelwell-monorepo.git
   ```

2. Install dependencies

   ```bash
   bun install --frozen-lockfile
   ```

3. Setup environment variables

   ```bash
   bun run scripts/setup-env.ts
   ```

4. Generate and add the signup cookie encryption secret to your `.env` file

   The frontend application uses an encrypted cookie to securely pass signup data during the counselor school creation flow. You need to generate a secure random secret:

   ```bash
   # Generate a 64-character hex string (32 bytes)
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   Then add it to `apps/frontend/.env`:

   ```bash
   SIGNUP_COOKIE_SECRET=<paste-your-generated-secret-here>
   ```

   **Important**:
   - Never commit this secret to version control
   - Use a different secret for each environment (local, staging, production)
   - The secret must be exactly 64 hex characters (32 bytes)

5. Start development server

   ```bash
   bun run dev
   ```

Refer to the README.md files in each application and package for more information.

## Deployment

### Automatic Deployment

The project uses GitHub Actions to automatically deploy to production when changes are pushed to the `main` branch. The workflow (`.github/workflows/deploy.yml`) will:
- Push database migrations to Supabase
- Deploy the application to Vercel

**Important**: The deployment workflow does **not** generate migrations automatically. If you make any schema changes, you must generate the migration locally to commit:
   ```bash
   bun run db:generate
   ```

The deployment workflow will then automatically apply the migration when you push to `main`.

### Manual Deployment

For manual deployments or local testing, the project includes a deployment script located at `scripts/deploy.ts` that automates the deployment process using Bun's shell API.

#### Prerequisites

Before running the deployment script, ensure you have:
- [Bun](https://bun.sh/) installed
- Access to Vercel and Supabase accounts
- Proper permissions for the target projects

#### Usage

The deployment script has two main commands:

#### Initialize Deployment Tools

```bash
bun run deploy:init
# or
bun scripts/deploy.ts init
```

This command will:
- Check if Vercel and Supabase CLI tools are installed globally
- Install them via Bun if missing
- Run `vercel login` to authenticate with Vercel
- Run `supabase login` from the `packages/database` directory to authenticate with Supabase
- Link to the Supabase project (`supabase link`) 

#### Deploy to Production

```bash
bun run deploy:push
# or
bun scripts/deploy.ts push
```

This command will:
- Push database changes (`supabase db push`) from the `packages/database` directory
- Deploy to Vercel production (`vercel --prod`) from the root directory

#### Help

```bash
bun scripts/deploy.ts help
```

Shows usage information and available commands.

### Notes

- The script requires the `packages/database` directory to exist for Supabase operations
- All commands include proper error handling and will exit with appropriate codes on failure
- The script uses cross-platform shell commands for compatibility across different operating systems

## Tools

1. VSCode (and VSCode-based editors) is the recommended editor for developing the project. The following extensions are recommended:
   - [Biome](https://marketplace.cursorapi.com/items?itemName=biomejs.biome):
     Integrates Biome into VS Code, visualizes the Biome errors and warnings in the editor, and provides code actions to fix the errors.
   - [Pretty Typescript Errors](https://marketplace.visualstudio.com/items?itemName=YoavBls.pretty-ts-errors):
     Make TypeScript errors prettier and more human-readable in VSCode
   - [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss):
     Provides intellisense for Tailwind CSS classes and utilities.
   - [Turborepo LSP](https://marketplace.visualstudio.com/items?itemName=Vercel.turbo-vsc): Provides LSP support for Turborepo.

   Recommended vs workspace settings(`.vscode/settings.json`):

   ```json
   {
     "typescript.tsdk": "node_modules/typescript/lib",
     "editor.defaultFormatter": "biomejs.biome",
     "editor.formatOnSave": true,
     "editor.formatOnPaste": true,
     "emmet.showExpandedAbbreviation": "never",
     "editor.codeActionsOnSave": {
       "source.fixAll.biome": "explicit",
       "source.organizeImports.biome": "explicit"
     },
     "[typescript]": {
       "editor.defaultFormatter": "biomejs.biome"
     },
     "[json]": {
       "editor.defaultFormatter": "biomejs.biome"
     },
     "[javascript]": {
       "editor.defaultFormatter": "biomejs.biome"
     },
     "[jsonc]": {
       "editor.defaultFormatter": "biomejs.biome"
     },
     "[typescriptreact]": {
       "editor.defaultFormatter": "biomejs.biome"
     }
   }
   ```

## Coding Principles

### Locality of Behavior

> The primary feature for easy maintenance is locality: Locality is that characteristic of source code that enables a programmer to understand that source by looking at only a small portion of it. – [Richard Gabriel](https://www.dreamsongs.com/Files/PatternsOfSoftware.pdf)

Locality of Behavior is the principle that:

> The behavior of a unit of code should be as obvious as possible by looking only at that unit of code.

Keep files small and focused. Having a large file is fine as long as the functions, types, components, etc. are logically grouped together.

### Readable Code over Micro-optimizations

Favor clear, readable code that accurately reflects its purpose over micro-optimizations that reduce clarity. Aim for code that other developers can understand and maintain without specialized knowledge of performance tricks.

Choose straightforward, predictable structures and patterns, even if they may be slightly less performant.

Code should be self documenting. Use comments only when necessary to explain complex logic or when the code is difficult to understand without them.

### Avoid Premature Optimization

Optimize only when there's a clear and demonstrated need for it. Premature optimization can complicate code without measurable gains and often leads to unpredictable issues.

### Stable Dependencies

Use well-maintained, stable libraries and frameworks over cutting-edge ones that may offer slight performance boosts but lack maturity and reliability.

## Conventions

### General Naming

Use standard naming conventions and avoid intermixing:

- `kebab-case` - File and folder names
- `camelCase` - Variables, consts and normal functions
- `PascalCase` - Enums, classes, interfaces, type definitions, React function components
- `UPPER_SNAKE_CASE` - Global constants

Note: `lower_snake_case` might be present only for the generated code from the OpenAPI spec.

Refer to application/package README.md files for more information.

## Git Workflow Guidelines

### Trunk-based Development

Use trunk-based development to streamline integration and deployment. All changes should be merged into the `main` branch frequently to avoid large merge conflicts and ensuring the codebase remains stable and up-to-date.

Changes pushed to the `main` branch gets built and deployed to staging directly. While for production use GitHub releases.

### Linear History

To maintain a clean history, always rebase your feature branch onto the `main` branch before merging.

1. Fetch the latest changes from remote:

   ```bash
   git fetch origin -p
   ```

2. While on your feature branch, rebase your changes onto the `main` branch:

   ```bash
   git rebase origin/main
   ```

3. Solve merge conflicts, if any.

4. Push your changes to your remote:

   ```bash
   git push origin <your-branch-name> --force
   ```

5. Use `Squash and Merge` to `main` combining all your commits into a single, meaningful commit. This keeps the history concise and linear.

### Commits

#### Message format

```
tag: A short summary without a period at the end

Optional, more detailed explanatory text. The blank line separating the summary from the body is critical.

Further paragraphs come after blank lines. 

- Bullet points are okay
- Typically a hyphen or asterisk is used for the bullet, followed by a single space
- In case of a bug fix, provide detail on the bug and how it was fixed
```

#### Tag rules 

- `fix` For a bug fix
- `feat` Either for a backwards-compatible enhancement of for a rule change that adds reported problems
- `fix!` For a backwards-incompatible bug fix
- `feat!` For a backwards-incompatible enhancement or feature
- `docs` Changes to documentation only
- `chore` For changes that aren't user-facing
- `build` Changes to the build process only
- `refactor` A change that doesn't affect the APIs or user experience
- `test` Just changes to test files
- `ci` Changes to the CI configuration files and scripts
- `perf` A code change that improves the performance
