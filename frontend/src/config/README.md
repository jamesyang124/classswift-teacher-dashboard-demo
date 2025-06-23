# Configuration

This directory contains centralized configuration for the application, including environment variables, feature flags, and demo settings.

## Files

### `env.ts` - **Centralized Environment Configuration**
Single source of truth for all environment variables and derived constants.

**Structure**:
```typescript
import { config } from '../config/env';

// API endpoints (derived from VITE_API_BASE_URL)
config.api.baseUrl           // 'http://localhost:3000/api/v1' (REST API)
config.api.wsBaseUrl         // 'ws://localhost:3000' (WebSocket base)
config.api.getWebSocketUrl  // Function to build WebSocket URLs

// Feature flags
config.features.isDemoMode      // true/false
config.features.isProduction    // true/false  
config.features.isDevelopment   // true/false

// App metadata
config.app.name     // 'ClassSwift Teacher Dashboard'
config.app.version  // '1.0.0'
```

### `development.ts` - **Demo/Development Features**
Environment-based demo configuration and mock utilities loader.

### `index.ts` - **Configuration Exports**
Barrel file for easy imports from any part of the application.

## Environment Variables

- `VITE_API_BASE_URL` - API base URL (default: http://localhost:3000/api/v1)
  - REST API: Used directly as-is
  - WebSocket: Automatically derived by removing `/api/v1` path
- `VITE_DEMO_MODE` - Enable demo features (default: true in dev, false in prod)

## Usage Examples

### API Service
```typescript
import { config } from '../config';

const response = await fetch(`${config.api.baseUrl}/classes/${classId}`);
```

### Feature Flags
```typescript
import { config } from '../config';

if (config.features.isDemoMode) {
  // Load demo functionality
}
```

### WebSocket Connection
```typescript
import { config } from '../config';

// Build complete WebSocket URL for a class
const wsUrl = config.api.getWebSocketUrl('X58E9647');
// Returns: 'ws://localhost:3000/api/v1/classes/X58E9647/ws'
```

## Benefits

- ✅ **Single Source of Truth** - All environment config in one place
- ✅ **Type Safety** - Full TypeScript support with proper types
- ✅ **No Duplication** - Eliminates duplicate API_BASE_URL definitions
- ✅ **Environment Separation** - Clear dev vs prod configuration
- ✅ **Easy Maintenance** - Change URLs in one place, updates everywhere
- ✅ **Feature Flags** - Centralized feature toggling
- ✅ **Consistent Imports** - Same import pattern across codebase