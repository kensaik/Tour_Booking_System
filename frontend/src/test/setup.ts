import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Node 25 ships an experimental localStorage that lacks Storage methods
// in some configurations and can shadow jsdom's. Install a deterministic
// in-memory polyfill to keep tests independent of host runtime quirks.
class MemoryStorage implements Storage {
  private data = new Map<string, string>()
  get length() {
    return this.data.size
  }
  clear(): void {
    this.data.clear()
  }
  getItem(key: string): string | null {
    return this.data.has(key) ? (this.data.get(key) as string) : null
  }
  key(index: number): string | null {
    return Array.from(this.data.keys())[index] ?? null
  }
  removeItem(key: string): void {
    this.data.delete(key)
  }
  setItem(key: string, value: string): void {
    this.data.set(key, String(value))
  }
}

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  writable: true,
  value: new MemoryStorage(),
})
Object.defineProperty(globalThis, 'sessionStorage', {
  configurable: true,
  writable: true,
  value: new MemoryStorage(),
})

afterEach(() => {
  cleanup()
  localStorage.clear()
  sessionStorage.clear()
})
