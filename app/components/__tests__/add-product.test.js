import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddProduct from '../add-product'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

// Mock BreadCrumb component
jest.mock('../bread-crumb', () => {
  return function MockBreadCrumb({ lists }) {
    return <div data-testid="breadcrumb">Breadcrumb</div>
  }
})

// Mock fetch
global.fetch = jest.fn()

describe('AddProduct Component', () => {
  beforeEach(() => {
    fetch.mockClear()
    mockPush.mockClear()
    window.alert = jest.fn()
  })

  test('renders form fields', () => {
    render(<AddProduct />)
    
    // Use getByName instead of getByRole since inputs don't have proper aria-labels
    expect(document.querySelector('input[name="title"]')).toBeInTheDocument()
    expect(document.querySelector('textarea[name="description"]')).toBeInTheDocument()
    expect(document.querySelector('input[name="price"]')).toBeInTheDocument()
    expect(screen.getByRole('button', { type: 'submit' })).toBeInTheDocument()
  })

  test('shows validation error for empty title', async () => {
    const user = userEvent.setup()
    render(<AddProduct />)
    
    const submitButton = screen.getByRole('button', { type: 'submit' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument()
    })

    expect(fetch).not.toHaveBeenCalled()
  })

  test('submits form with valid data', async () => {
    const user = userEvent.setup()
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Product created successfully' })
    })

    render(<AddProduct />)
    
    // Use querySelector to get inputs by name
    const titleInput = document.querySelector('input[name="title"]')
    const descriptionInput = document.querySelector('textarea[name="description"]')
    const priceInput = document.querySelector('input[name="price"]')
    
    await user.type(titleInput, 'Test Product')
    await user.type(descriptionInput, 'Test Description')
    await user.type(priceInput, '100')
    
    const submitButton = screen.getByRole('button', { type: 'submit' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('../api', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Product',
          description: 'Test Description',
          price: '100'
        })
      })
    })

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Product created successfully')
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  test('handles API error', async () => {
    const user = userEvent.setup()
    
    fetch.mockResolvedValueOnce({
      ok: false
    })

    render(<AddProduct />)
    
    const titleInput = document.querySelector('input[name="title"]')
    const descriptionInput = document.querySelector('textarea[name="description"]')
    const priceInput = document.querySelector('input[name="price"]')
    
    await user.type(titleInput, 'Test Product')
    await user.type(descriptionInput, 'Test Description')
    await user.type(priceInput, '100')
    
    const submitButton = screen.getByRole('button', { type: 'submit' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to add product')
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  test('shows validation error for empty description', async () => {
    const user = userEvent.setup()
    render(<AddProduct />)
    
    const titleInput = document.querySelector('input[name="title"]')
    await user.type(titleInput, 'Test Product')
    
    const submitButton = screen.getByRole('button', { type: 'submit' })
    await user.click(submitButton)

    await waitFor(() => {
      // Form validation should prevent submission
      expect(fetch).not.toHaveBeenCalled()
    })
  })
})