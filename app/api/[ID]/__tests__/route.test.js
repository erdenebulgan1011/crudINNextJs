import { GET, POST, DELETE } from '../route'
import Products from '@/app/models/products'
import { connectMongoDB } from '@/app/libs/mongodb'

jest.mock('@/app/models/products', () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn()
  }
}))

jest.mock('@/app/libs/mongodb', () => ({
  connectMongoDB: jest.fn()
}))

describe('/api/[ID] Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    console.log = jest.fn()
    console.error = jest.fn()
  })

  describe('GET', () => {
    test('returns product successfully', async () => {
      const mockProduct = { _id: '1', title: 'Product', description: 'Desc', price: 100 }
      const mockRequest = {}
      const mockParams = Promise.resolve({ ID: '1' })

      Products.findById = jest.fn().mockResolvedValue(mockProduct)

      const response = await GET(mockRequest, { params: mockParams })
      const data = await response.json()

      expect(connectMongoDB).toHaveBeenCalled()
      expect(Products.findById).toHaveBeenCalledWith('1')
      expect(response.status).toBe(200)
      expect(data.product).toEqual(mockProduct)
    })

    test('returns 404 when product not found', async () => {
      const mockRequest = {}
      const mockParams = Promise.resolve({ ID: '999' })

      Products.findById = jest.fn().mockResolvedValue(null)

      const response = await GET(mockRequest, { params: mockParams })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Product not found')
    })

    test('handles database error', async () => {
      const mockRequest = {}
      const mockParams = Promise.resolve({ ID: '1' })

      Products.findById = jest.fn().mockRejectedValue(new Error('DB Error'))

      const response = await GET(mockRequest, { params: mockParams })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch product')
    })
  })

  describe('POST', () => {
    test('updates product successfully', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          title: 'Updated Product',
          description: 'Updated Description',
          price: 200
        })
      }
      const mockParams = Promise.resolve({ ID: '1' })

      Products.findByIdAndUpdate = jest.fn().mockResolvedValue({})

      const response = await POST(mockRequest, { params: mockParams })
      const data = await response.json()

      expect(connectMongoDB).toHaveBeenCalled()
      expect(Products.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { title: 'Updated Product', description: 'Updated Description', price: 200 },
        { new: true }
      )
      expect(response.status).toBe(200)
      expect(data.message).toBe('Product updated successfully')
    })

    test('handles update error', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({ title: 'Product', description: 'Desc', price: 100 })
      }
      const mockParams = Promise.resolve({ ID: '1' })

      Products.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Update failed'))

      await expect(POST(mockRequest, { params: mockParams })).rejects.toThrow('Update failed')
    })
  })

  describe('DELETE', () => {
    test('deletes product successfully', async () => {
      const mockRequest = {}
      const mockParams = Promise.resolve({ ID: '1' })

      Products.findByIdAndDelete = jest.fn().mockResolvedValue({})

      const response = await DELETE(mockRequest, { params: mockParams })
      const data = await response.json()

      expect(connectMongoDB).toHaveBeenCalled()
      expect(Products.findByIdAndDelete).toHaveBeenCalledWith('1')
      expect(response.status).toBe(200)
      expect(data.message).toBe('Product deleted successfully')
    })

    test('handles delete error', async () => {
      const mockRequest = {}
      const mockParams = Promise.resolve({ ID: '1' })

      Products.findByIdAndDelete = jest.fn().mockRejectedValue(new Error('Delete failed'))

      const response = await DELETE(mockRequest, { params: mockParams })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to delete product')
    })
  })
})