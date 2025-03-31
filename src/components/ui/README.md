# UI Components

## Error Handling Components

### Recommended Approach

For consistent error handling across the application, use the following components:

#### `InfoBox` (primary component)

The most flexible component for showing informational messages, including errors:

```jsx
import InfoBox from "../components/ui/InfoBox";

// Basic usage
<InfoBox variant="error" title="Error">
  Something went wrong.
</InfoBox>

// With retry button
<InfoBox variant="error" title="Error">
  <p>Failed to load data.</p>
  <Button onClick={handleRetry}>Try Again</Button>
</InfoBox>

// Available variants: "info", "warning", "success", "error"
```

#### Legacy Components

These components are maintained for backwards compatibility but new code should use `InfoBox`:

1. **`Error`** - Simple error display, now uses `InfoBox` internally

   ```jsx
   <Error message="Something went wrong" retry={handleRetry} />
   ```

2. **`ErrorBanner`** - For API errors, with special handling for GitHub rate limiting

   ```jsx
   <ErrorBanner error={error} onRetry={handleRetry} />
   ```

3. **`FullPageError`** - For critical application errors
   ```jsx
   <FullPageError error={error} onRetry={handleRetry} actions={<Button>Go Home</Button>} />
   ```

### Migration Strategy

1. Use `InfoBox` for all new error handling needs
2. Gradually replace existing `Error` and `ErrorBanner` usage with `InfoBox`
3. Keep using `FullPageError` for application-level errors requiring a full-page treatment

By standardizing on `InfoBox`, we maintain a consistent UI pattern while providing flexibility for different error scenarios.
