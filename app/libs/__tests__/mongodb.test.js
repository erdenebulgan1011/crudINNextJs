import mongoose from 'mongoose'

jest.mock('mongoose')

// Clear module cache before each test to allow re-requiring
const clearModuleCache = () => {
  delete require.cache[require.resolve('../mongodb')]
}

describe('MongoDB Connection', () => {
    beforeEach(() => {
      jest.clearAllMocks()
      console.error = jest.fn()
      console.log = jest.fn()
      mongoose.connection.readyState = 0
    })

  afterEach(() => {
    process.env = originalEnv
    console.error = originalError
    console.log = originalLog
  })

  test('throws error when MONGODB_URL is not defined', () => {
    delete process.env.MONGODB_URL

    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('../mongodb')
    }).toThrow('MONGODB_URL is not defined in .env.local')
  })

  test('connects to MongoDB successfully', async () => {
    process.env.MONGODB_URL = 'mongodb://localhost:27017/test'
    
    // Dynamically import after setting env var
    const { connectMongoDB } = await import('../mongodb')
    
    mongoose.connect = jest.fn().mockResolvedValue(undefined)

    await connectMongoDB()

    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGODB_URL)
  })

  test('does not reconnect if already connected (readyState = 1)', async () => {
    process.env.MONGODB_URL = 'mongodb://localhost:27017/test'
    mongoose.connection.readyState = 1
    
    const { connectMongoDB } = await import('../mongodb')

    await connectMongoDB()

    expect(mongoose.connect).not.toHaveBeenCalled()
  })

  test('handles connection error', async () => {
    process.env.MONGODB_URL = 'mongodb://localhost:27017/test'
    const { connectMongoDB } = await import('../mongodb')
    const error = new Error('Connection failed')
    mongoose.connect = jest.fn().mockRejectedValue(error)

    await expect(connectMongoDB()).rejects.toThrow('Connection failed')
  })
})