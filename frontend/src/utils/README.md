# Utilities

This directory contains utility functions and helpers for the application.

## Files

### `qrImageProps.ts`
Environment-aware utility for creating QR code image properties.

**Purpose**: Provides different QR image behavior based on environment:
- **Development/Demo**: Interactive QR codes with click simulation
- **Production**: Static QR codes without interaction

**Usage**:
```typescript
import { createQRImageProps } from '../utils/qrImageProps';

const props = await createQRImageProps(src, alt, classId);
// Returns appropriate props for the current environment
```

### `mockJoin.ts`
Mock utilities for simulating student joining via QR code (development only).

**Purpose**: Provides demo functionality for QR code scanning simulation.

**Usage**:
```typescript
import { mockStudentJoin } from '../utils/mockJoin';

await mockStudentJoin(classId);
// Simulates a random student joining the class
```

## Benefits

- ✅ **Environment Separation**: Development features don't leak into production
- ✅ **Clean Components**: Business logic stays in utilities, not components
- ✅ **Tree Shaking**: Unused code is automatically removed from production builds
- ✅ **Type Safety**: Full TypeScript support with proper interfaces
- ✅ **Testable**: Utilities can be easily unit tested