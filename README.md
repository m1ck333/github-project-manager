# GitHub Project Manager Frontend

## Architecture Improvements

The codebase has been restructured to improve maintainability and adhere to best practices in several key areas:

### 1. Shared Services Architecture

- Created a common services layer in `src/common/services/`
- Implemented base abstract classes for common service patterns:
  - `AbstractCrudService`: Reusable base for all CRUD operations
  - `AbstractSearchService`: Standardized search functionality across features
- Reduced code duplication by centralizing common service patterns
- Added comprehensive documentation in `src/common/services/README.md`

### 2. Component Structure Improvements

- Flattened the Typography component from nested structure:
  - From: `src/common/components/ui/typography/Typography/`
  - To: `src/common/components/ui/Typography/`
- Moved Search component to composed folder to better reflect its complexity:
  - From: `src/common/components/ui/search/Search/`
  - To: `src/common/components/composed/Search/`
- Added documentation in `src/common/components/README.md`

### 3. State Management Consistency

- Created base abstract store patterns for future refactoring
- Made all state management follow the same pattern and structure
- Improved the store-service separation of concerns

These changes support better maintainability, reduce duplication, and enhance the project structure without disrupting existing functionality.

## Running the Application

To get started with the GitHub Project Manager frontend, follow these steps:

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Open http://localhost:5173 to view the application

## Available Scripts

In the project directory, you can run:

- `npm run dev` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm run lint` - Lints the code using ESLint
- `npm run preview` - Previews the production build locally
