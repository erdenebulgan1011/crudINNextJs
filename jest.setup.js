// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock mongoose and mongodb BEFORE any imports
jest.mock('mongoose', () => {
  const mockSchema = jest.fn().mockImplementation(() => ({}))
  const mockModel = jest.fn()
  const mockConnect = jest.fn()
  
  return {
    __esModule: true,
    default: {
      models: {},
      model: mockModel,
      Schema: mockSchema,
      connect: mockConnect,
      connection: {
        readyState: 0
      }
    },
    Schema: mockSchema,
    model: mockModel
  }
})

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock Next.js Link component
jest.mock('next/link', () => {
  // eslint-disable-next-line react/display-name
  return ({ children, href }) => {
    return <a href={href}>{children}</a>
  }
})

// Suppress console errors in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
}