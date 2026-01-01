import { GET, POST } from '../route'
import Products from '@/app/models/products'
import { connectMongoDB } from '@/app/libs/mongodb'
import { NextResponse } from 'next/server'

// Mock dependencies
jest.mock('@/app/models/products', () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    create: jest.fn()
  }
}))

jest.mock('@/app/libs/mongodb', () => ({
  connectMongoDB: jest.fn()
}))

describe('/api Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    test('returns all products successfully', async () => {
      const mockProducts = [
        { _id: '1', title: 'Product 1', description: 'Desc 1', price: 100 },
        { _id: '2', title: 'Product 2', description: 'Desc 2', price: 200 }
      ]

      Products.find = jest.fn().mockResolvedValue(mockProducts)

      const response = await GET()
      const data = await response.json()

      expect(connectMongoDB).toHaveBeenCalled()
      expect(Products.find).toHaveBeenCalled()
      expect(response.status).toBe(200)
      expect(data.products).toEqual(mockProducts)
    })

    test('handles database error', async () => {
      Products.find = jest.fn().mockRejectedValue(new Error('DB Error'))

      await expect(GET()).rejects.toThrow('DB Error')
    })

    test('handles empty products array', async () => {
      Products.find = jest.fn().mockResolvedValue([])

      const response = await GET()
      const data = await response.json()

      expect(data.products).toEqual([])
      expect(response.status).toBe(200)
    })
  })

  describe('POST', () => {
    test('creates product successfully', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          title: 'New Product',
          description: 'New Description',
          price: 150
        })
      }

      Products.create = jest.fn().mockResolvedValue({})

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(connectMongoDB).toHaveBeenCalled()
      expect(Products.create).toHaveBeenCalledWith({
        title: 'New Product',
        description: 'New Description',
        price: 150
      })
      expect(response.status).toBe(200)
      expect(data.message).toBe('Product created successfully')
    })

    test('handles invalid request data', async () => {
      const mockRequest = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      }

      await expect(POST(mockRequest)).rejects.toThrow('Invalid JSON')
    })

    test('handles database creation error', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          title: 'Product',
          description: 'Desc',
          price: 100
        })
      }

      Products.create = jest.fn().mockRejectedValue(new Error('Creation failed'))

      await expect(POST(mockRequest)).rejects.toThrow('Creation failed')
    })
  })
})