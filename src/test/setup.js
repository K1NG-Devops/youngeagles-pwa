// Test setup file
import { vi } from 'vitest'

// Mock global objects
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
}

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock

// Mock environment variables
global.import = {
  meta: {
    env: {
      VITE_API_BASE_URL: 'https://youngeagles-api-server.up.railway.app',
      VITE_API_LOCAL_URL: 'http://localhost:3001',
      VITE_FORCE_LOCAL_API: 'false',
      VITE_DEBUG_MODE: 'true',
      DEV: false,
      PROD: true,
    }
  }
}
