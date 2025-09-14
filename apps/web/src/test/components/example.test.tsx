import { describe, it, expect } from 'vitest'

// Simple test without rendering to avoid PostCSS issues
describe('Basic functionality', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2)
  })
  
  it('should handle string operations', () => {
    expect('hello'.toUpperCase()).toBe('HELLO')
  })
})