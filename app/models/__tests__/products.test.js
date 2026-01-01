import mongoose from 'mongoose'
import Products from '../products'

jest.mock('mongoose', () => ({
  models: {},
  model: jest.fn(),
  Schema: jest.fn()
}))

describe('Products Model', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mongoose.models = {}
  })

  test('creates new model when it does not exist', () => {
    const mockModel = jest.fn()
    mongoose.model = jest.fn().mockReturnValue(mockModel)

    const result = Products

    expect(mongoose.model).toHaveBeenCalledWith('Products', expect.any(Object))
  })
  test('model can be imported without errors', () => {
    // Since mongoose is mocked in jest.setup.js, we just verify the module loads
    expect(mongoose).toBeDefined()
    expect(mongoose.Schema).toBeDefined()
    expect(mongoose.model).toBeDefined()
  })

  test('mongoose.models exists', () => {
    expect(mongoose.models).toBeDefined()
    expect(typeof mongoose.models).toBe('object')
  })


  test('uses existing model when it exists', () => {
    const existingModel = jest.fn()
    mongoose.models.Products = existingModel

    const result = Products

    expect(result).toBe(existingModel)
    expect(mongoose.model).not.toHaveBeenCalled()
  })

  test('schema is defined correctly', () => {
    expect(mongoose.Schema).toHaveBeenCalled()
    const schemaCall = mongoose.Schema.mock.calls[0]
    expect(schemaCall[0]).toHaveProperty('title')
    expect(schemaCall[0]).toHaveProperty('description')
    expect(schemaCall[0]).toHaveProperty('price')
    expect(schemaCall[1]).toHaveProperty('timestamps', true)
  })
})