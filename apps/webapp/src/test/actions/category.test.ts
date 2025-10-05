/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach, type MockedFunction } from 'vitest'
import { createCategory } from '@/actions/category'

// Mock dependencies with proper hoisting
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    category: {
      create: vi.fn(),
    },
  },
}))

// Import mocked functions after mocking
const { auth } = await import('@/auth')
const { prisma } = await import('@/lib/prisma')

const mockAuth = vi.mocked(auth) as unknown as MockedFunction<() => Promise<unknown>>
const mockPrismaCategory = vi.mocked(prisma.category)

describe('Category Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createCategory', () => {
    it('should create category for authenticated user', async () => {
      // Arrange
      const mockSession = { user: { id: 'user-123' } }
      const mockCategory = {
        id: 'cat-123',
        name: 'Food',
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockAuth.mockResolvedValue(mockSession)
      mockPrismaCategory.create.mockResolvedValue(mockCategory)

      // Act
      const result = await createCategory('Food')

      // Assert
      expect(result).toEqual({
        success: true,
        data: mockCategory,
      })
      expect(mockPrismaCategory.create).toHaveBeenCalledWith({
        data: {
          name: 'Food',
          userId: 'user-123',
        },
      })
    })

    it('should return error for unauthenticated user', async () => {
      // Arrange
      mockAuth.mockResolvedValue(null)

      // Act
      const result = await createCategory('Food')

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Unauthorized',
      })
      expect(mockPrismaCategory.create).not.toHaveBeenCalled()
    })

    it('should return error when session has no user', async () => {
      // Arrange
      mockAuth.mockResolvedValue({ user: null })

      // Act
      const result = await createCategory('Food')

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Unauthorized',
      })
      expect(mockPrismaCategory.create).not.toHaveBeenCalled()
    })

    it('should return error when session user has no id', async () => {
      // Arrange
      mockAuth.mockResolvedValue({ user: {} })

      // Act
      const result = await createCategory('Food')

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Unauthorized',
      })
      expect(mockPrismaCategory.create).not.toHaveBeenCalled()
    })

    it('should handle database errors gracefully', async () => {
      // Arrange
      const mockSession = { user: { id: 'user-123' } }
      mockAuth.mockResolvedValue(mockSession)
      mockPrismaCategory.create.mockRejectedValue(new Error('Database connection failed'))

      // Act
      const result = await createCategory('Food')

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Database connection failed',
      })
    })

    it('should handle non-Error exceptions', async () => {
      // Arrange
      const mockSession = { user: { id: 'user-123' } }
      mockAuth.mockResolvedValue(mockSession)
      mockPrismaCategory.create.mockRejectedValue('String error')

      // Act
      const result = await createCategory('Food')

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Failed to create category',
      })
    })

    it('should create category with correct name parameter', async () => {
      // Arrange
      const mockSession = { user: { id: 'user-123' } }
      const categoryName = 'Transportation'
      const mockCategory = {
        id: 'cat-456',
        name: categoryName,
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockAuth.mockResolvedValue(mockSession)
      mockPrismaCategory.create.mockResolvedValue(mockCategory)

      // Act
      const result = await createCategory(categoryName)

      // Assert
      expect(result.success).toBe(true)
      expect(mockPrismaCategory.create).toHaveBeenCalledWith({
        data: {
          name: categoryName,
          userId: 'user-123',
        },
      })
    })

    it('should handle empty category name', async () => {
      // Arrange
      const mockSession = { user: { id: 'user-123' } }
      const mockCategory = {
        id: 'cat-789',
        name: '',
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockAuth.mockResolvedValue(mockSession)
      mockPrismaCategory.create.mockResolvedValue(mockCategory)

      // Act
      const result = await createCategory('')

      // Assert
      expect(result.success).toBe(true)
      expect(mockPrismaCategory.create).toHaveBeenCalledWith({
        data: {
          name: '',
          userId: 'user-123',
        },
      })
    })
  })
})