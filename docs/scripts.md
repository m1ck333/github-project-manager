# NPM Scripts Documentation

This document provides detailed information about the available scripts in this project.

## Development & Build Scripts

| Script            | Description                              | When to Use                                    |
| ----------------- | ---------------------------------------- | ---------------------------------------------- |
| `npm run dev`     | Starts the development server using Vite | During active development                      |
| `npm run build`   | Builds the application for production    | When preparing for deployment                  |
| `npm run preview` | Locally previews the production build    | To test the production build before deployment |

## Code Quality Scripts

| Script                 | Description                                | Changes Files? | When to Use                                 |
| ---------------------- | ------------------------------------------ | -------------- | ------------------------------------------- |
| `npm run lint`         | Runs ESLint to check for code issues       | No             | In CI pipelines or to just view issues      |
| `npm run lint:fix`     | Runs ESLint and fixes issues automatically | Yes            | When you want to fix only linting issues    |
| `npm run format`       | Runs Prettier to format all code files     | Yes            | When you want to fix only formatting issues |
| `npm run format:check` | Checks if files are properly formatted     | No             | In CI pipelines to verify formatting        |
| `npm run check`        | Runs both format:check and lint            | No             | In CI pipelines for comprehensive checks    |
| `npm run fix`          | Runs both format and lint:fix              | Yes            | Before committing to ensure clean code      |

## Code Generation Scripts

| Script            | Description                                    | When to Use                                 |
| ----------------- | ---------------------------------------------- | ------------------------------------------- |
| `npm run codegen` | Generates TypeScript types from GraphQL schema | After changing GraphQL queries or mutations |

## Git Hooks

| Script            | Description                 | When to Use                           |
| ----------------- | --------------------------- | ------------------------------------- |
| `npm run prepare` | Sets up Husky for Git hooks | Automatically run after `npm install` |

## Script Relationships

- `check` = `format:check` + `lint` (check only, doesn't modify files)
- `fix` = `format` + `lint:fix` (fixes all issues automatically)

## Recommended Workflow

1. During development, use `npm run dev` to start the server
2. Before committing, run `npm run fix` to automatically fix formatting and linting issues
3. In CI pipelines, use `npm run check` to verify code quality
4. After changing GraphQL queries, run `npm run codegen` to update TypeScript types
5. Before deployment, run `npm run build` to create the production build
