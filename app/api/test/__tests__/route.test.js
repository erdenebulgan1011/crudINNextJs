import { GET } from '../route'
import dbConnect from '@/lib/mongodb'

jest.mock('@/lib/mongodb', () => ({
    __esModule: true,
    default: jest.fn()
  }))
// Dynamic import to get the mocked module
const dbConnect = require('@/lib/mongodb').default

describe('/api/test Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('returns MongoDB connection status', async () => {
    dbConnect.mockResolvedValue(undefined)

    const response = await GET()
    const data = await response.json()

    expect(dbConnect).toHaveBeenCalled()
    expect(response.status).toBe(200)
    expect(data.message).toBe('MongoDB connected ✅')
  })

  test('handles connection error', async () => {
    dbConnect.mockRejectedValue(new Error('Connection failed'))

    await expect(GET()).rejects.toThrow('Connection failed')
  })
})