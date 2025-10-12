/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach, type MockedFunction } from 'vitest'
import { createTransaction } from '@/actions/transaction'
import { $Enums } from '@prisma/client'
import type { Session } from 'next-auth'

// Mock dependencies
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    category: {
      findUnique: vi.fn(),
    },
    transaction: {
      create: vi.fn(),
    },
  },
}))

// Import mocked functions after mocking
const { auth } = await import('@/auth')
const { prisma } = await import('@/lib/prisma')

const mockAuth = vi.mocked(auth) as unknown as MockedFunction<() => Promise<Session | null>>
const mockPrismaCategory = vi.mocked(prisma.category)
const mockPrismaTransaction = vi.mocked(prisma.transaction)

describe('Transaction Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createTransaction', () => {
    const validInput = {
      amount: 100.50,
      categoryId: 'cat-123',
      type: $Enums.TransactionType.EXPENSE,
      description: 'Groceries',
      date: '2024-01-01',
    }

    it('should create transaction for authenticated user with valid category', async () => {
      // Arrange
      const mockSession: Session = { 
        user: { id: 'user-123', name: null, email: 'test@example.com', image: null },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
      const mockCategory = { 
        id: 'cat-123',
        name: 'Food',
        userId: 'user-123'
      }
      const mockTransaction = {
        id: 'trans-123',
        amount: { toString: () => '100.50' } as unknown as import('@prisma/client').Prisma.Decimal,
        type: $Enums.TransactionType.EXPENSE,
        categoryId: 'cat-123',
        description: 'Groceries',
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockAuth.mockResolvedValue(mockSession)
      mockPrismaCategory.findUnique.mockResolvedValue(mockCategory)
      mockPrismaTransaction.create.mockResolvedValue(mockTransaction)

      // Act
      const result = await createTransaction(validInput)

      // Assert
      expect(result).toEqual({
        data: {
          ...mockTransaction,
          amount: '100.50',
        },
      })
      expect(mockPrismaCategory.findUnique).toHaveBeenCalledWith({
        where: { id: 'cat-123' },
        select: { id: true },
      })
      expect(mockPrismaTransaction.create).toHaveBeenCalledWith({
        data: {
          amount: 100.50,
          type: $Enums.TransactionType.EXPENSE,
          categoryId: 'cat-123',
          description: 'Groceries',
          userId: 'user-123',
        },
      })
    })

    it('should return error for unauthenticated user', async () => {
      // Arrange
      mockAuth.mockResolvedValue(null)

      // Act
      const result = await createTransaction(validInput)

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Unauthorized',
      })
      expect(mockPrismaCategory.findUnique).not.toHaveBeenCalled()
      expect(mockPrismaTransaction.create).not.toHaveBeenCalled()
    })

    it('should return error when session has no user', async () => {
      // Arrange
      mockAuth.mockResolvedValue(null)

      // Act
      const result = await createTransaction(validInput)

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Unauthorized',
      })
      expect(mockPrismaCategory.findUnique).not.toHaveBeenCalled()
      expect(mockPrismaTransaction.create).not.toHaveBeenCalled()
    })

    it('should return error when session user has no id', async () => {
      // Arrange
      const mockSession: Session = {
        user: { name: null, email: 'test@example.com', image: null },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
      mockAuth.mockResolvedValue(mockSession)

      // Act
      const result = await createTransaction(validInput)

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Unauthorized',
      })
      expect(mockPrismaCategory.findUnique).not.toHaveBeenCalled()
      expect(mockPrismaTransaction.create).not.toHaveBeenCalled()
    })
  })
})