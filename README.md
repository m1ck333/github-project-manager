# GitHub Project Manager

A React application for managing GitHub projects, boards, and issues.

## Features

- Create and manage GitHub projects
- Create and manage project boards
- Add and manage labels for project boards
- Create and manage issues
- Move issues through board states
- Add and manage collaborators on projects

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- GitHub Personal Access Token with the following permissions:
  - `repo` (Full control of private repositories)
  - `project` (Full control of organization projects)

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd <repository-name>
```

2. Install dependencies:

```bash
npm install
```

3. Set up GitHub Personal Access Token:
   - Go to [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens)
   - Click "Generate new token (classic)"
   - Give it a descriptive name
   - Select the following permissions:
     - `repo` (Full control of private repositories)
     - `project` (Full control of organization projects)
   - Copy the generated token
   - Create a `.env` file in the root directory and add your token:

```env
VITE_GITHUB_TOKEN=your_github_token_here
```

4. Start the development server:

```bash
npm run dev
```

## Available Scripts

### Development & Build

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally

### Code Quality

- `npm run lint` - Check for linting errors without fixing them
- `npm run lint:fix` - Check for linting errors and fix them automatically
- `npm run format` - Format code using Prettier
- `npm run format:check` - Check code formatting without changing files
- `npm run check` - Check both formatting and linting (ideal for CI)
- `npm run fix` - Fix both formatting and linting issues in one command (ideal for development)

### Code Generation

- `npm run codegen` - Generate TypeScript types from GraphQL schema

## Project Structure

```
src/
├── api/          # API client and GraphQL operations
├── components/   # Reusable UI components
|   ├── ui/       # Basic UI components (buttons, inputs, etc.)
|   ├── layout/   # Layout components (headers, containers, etc.)
|   └── features/ # Feature-specific components
├── services/     # Business logic and API services
├── store/        # MobX stores
├── types/        # TypeScript type definitions
├── utils/        # Utility functions and validation schemas
└── styles/       # Global styles and theme
```

## Technologies Used

- React
- TypeScript
- Vite
- MobX for state management
- URQL for GraphQL operations
- Zod for schema validation
- SCSS Modules for styling

## Development

- The application uses TypeScript for type safety
- MobX is used for state management
- URQL is used for GraphQL operations
- Zod is used for form validation
- SCSS Modules are used for styling

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
