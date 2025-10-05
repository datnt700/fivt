/**
 * @vitest-environment node
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, type MockedFunction } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST, DELETE, PUT } from '../../app/api/financial-profile/route'

// Mock dependencies
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('@/lib/financial-profile-calculator', () => ({
  calculateFinancialProfile: vi.fn(),
  validateFinancialInput: vi.fn(),
}))

// Import mocked functions after mocking
const { auth } = await import('@/auth')
const { prisma } = await import('@/lib/prisma')
const { 
  calculateFinancialProfile, 
  validateFinancialInput 
} = await import('@/lib/financial-profile-calculator')

const mockAuth = vi.mocked(auth) as unknown as MockedFunction<() => Promise<unknown>>
const mockUserFindUnique = vi.mocked(prisma.user.findUnique)
const mockCalculateFinancialProfile = vi.mocked(calculateFinancialProfile)
const mockValidateFinancialInput = vi.mocked(validateFinancialInput)

describe('/api/financial-profile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET', () => {
    it('should return 401 for unauthenticated requests', async () => {
      mockAuth.mockResolvedValue(null)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({ error: 'Unauthorized' })
      expect(mockUserFindUnique).not.toHaveBeenCalled()
    })

    it('should return 401 when session has no user', async () => {
      mockAuth.mockResolvedValue({ user: null })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({ error: 'Unauthorized' })
      expect(mockUserFindUnique).not.toHaveBeenCalled()
    })

    it('should return 401 when session user has no id', async () => {
      mockAuth.mockResolvedValue({ user: {} })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({ error: 'Unauthorized' })
      expect(mockUserFindUnique).not.toHaveBeenCalled()
    })

    it('should return 404 when user is not found', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-123' } })
      mockUserFindUnique.mockResolvedValue(null)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data).toEqual({ error: 'User not found' })
      expect(mockUserFindUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        include: {
          transactions: {
            take: 10,
            orderBy: { createdAt: 'desc' }
          }
        }
      })
    })

    it('should return 404 when user exists but profile not completed', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-123' } })
      mockUserFindUnique.mockResolvedValue({
        id: 'user-123',
        name: null,
        email: 'test@example.com',
        emailVerified: null,
        image: null,
        isBanned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        timezone: null,
        transactions: []
      } as any)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data).toEqual({
        error: 'Financial profile not found',
        message: 'User needs to complete their financial profile setup'
      })
    })

    it('should handle database errors', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-123' } })
      mockUserFindUnique.mockRejectedValue(new Error('Database error'))

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Internal server error' })
    })
  })

  describe('POST', () => {
    const mockRequestWithBody = (body: unknown) => ({
      json: vi.fn().mockResolvedValue(body)
    } as unknown as NextRequest)

    it('should return 401 for unauthenticated requests', async () => {
      mockAuth.mockResolvedValue(null)
      const request = mockRequestWithBody({})

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({ error: 'Unauthorized' })
    })

    it('should return 400 for invalid financial data', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-123' } })
      mockValidateFinancialInput.mockReturnValue({
        isValid: false,
        errors: ['Monthly income is required', 'Age must be a positive number']
      })

      const request = mockRequestWithBody({
        monthlyIncome: '',
        age: -5
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        error: 'Invalid financial data',
        details: ['Monthly income is required', 'Age must be a positive number']
      })
      expect(mockCalculateFinancialProfile).not.toHaveBeenCalled()
    })

    it('should successfully calculate and return financial profile', async () => {
      const mockSession = { user: { id: 'user-123' } }
      const mockInput = {
        monthlyIncome: 5000,
        monthlyExpenses: 3000,
        age: 30,
        riskTolerance: 'moderate'
      }
      const mockCalculationResult = {
        profile: {
          stage: 'accumulation',
          category: 'growth-focused',
          income: { monthly: 5000, annual: 60000 },
          expenses: { monthly: 3000, annual: 36000 },
          savings: { monthly: 2000, annual: 24000 },
          investments: { total: 0, monthly: 0 },
          debt: { total: 0, monthly: 0 },
          netWorth: 24000,
          emergencyFund: { current: 0, recommended: 9000 }
        },
        insights: ['You have a healthy savings rate'],
        recommendations: ['Consider increasing your emergency fund']
      }

      mockAuth.mockResolvedValue(mockSession)
      mockValidateFinancialInput.mockReturnValue({ isValid: true, errors: [] })
      mockCalculateFinancialProfile.mockReturnValue(mockCalculationResult as any)

      const request = mockRequestWithBody(mockInput)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        profile: mockCalculationResult.profile,
        insights: mockCalculationResult.insights,
        recommendations: mockCalculationResult.recommendations,
        calculatedAt: expect.any(String),
        message: 'Financial profile calculated successfully'
      })
      expect(mockValidateFinancialInput).toHaveBeenCalledWith(mockInput)
      expect(mockCalculateFinancialProfile).toHaveBeenCalledWith(mockInput)
    })

    it('should handle JSON parsing errors', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-123' } })
      
      const request = {
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON'))
      } as unknown as NextRequest

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Internal server error' })
    })

    it('should handle calculation errors', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-123' } })
      mockValidateFinancialInput.mockReturnValue({ isValid: true, errors: [] })
      mockCalculateFinancialProfile.mockImplementation(() => {
        throw new Error('Calculation failed')
      })

      const request = mockRequestWithBody({
        monthlyIncome: 5000,
        monthlyExpenses: 3000
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Internal server error' })
    })
  })

  describe('DELETE', () => {
    it('should return 401 for unauthenticated requests', async () => {
      mockAuth.mockResolvedValue(null)

      const response = await DELETE()
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({ error: 'Unauthorized' })
    })

    it('should successfully delete financial profile', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-123' } })

      const response = await DELETE()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        message: 'Financial profile deleted successfully'
      })
    })

    it('should successfully delete financial profile', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-123' } })

      const response = await DELETE()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        message: 'Financial profile deleted successfully'
      })
    })
  })

  describe('PUT', () => {
    it('should return 401 for unauthenticated requests', async () => {
      mockAuth.mockResolvedValue(null)

      const response = await PUT()
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({ error: 'Unauthorized' })
    })

    it('should return success message for recalculation (not yet implemented)', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-123' } })

      const response = await PUT()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        message: 'Profile recalculation not yet implemented',
        todo: 'Implement data aggregation from user sources'
      })
    })

    it('should return success message for recalculation placeholder', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-123' } })

      const response = await PUT()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        message: 'Profile recalculation not yet implemented',
        todo: 'Implement data aggregation from user sources'
      })
    })
  })
})