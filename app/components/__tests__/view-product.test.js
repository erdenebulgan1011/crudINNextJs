import { render, screen, waitFor } from '@testing-library/react'
import ViewProduct from '../view-product'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() })
}))

jest.mock('../bread-crumb', () => {
  return function MockBreadCrumb() {
    return <div data-testid="breadcrumb">Breadcrumb</div>
  }
})

global.fetch = jest.fn()
window.alert = jest.fn()

describe('ViewProduct Component', () => {
  beforeEach(() => {
    fetch.mockClear()
    window.alert.mockClear()
  })

  test('shows loading state initially', () => {
    fetch.mockImplementation(() => new Promise(() => {})) // Never resolves
    
    render(<ViewProduct id="1" />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  test('renders product data after loading', async () => {
    const mockProduct = {
      _id: '1',
      title: 'Test Product',
      description: 'Test Description',
      price: 100
    }

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ product: mockProduct })
    })

    render(<ViewProduct id="1" />)

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument()
      expect(screen.getByDisplayValue('100')).toBeInTheDocument()
    })
  })

  test('shows error when product not found', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ product: null })
    })

    render(<ViewProduct id="1" />)

    await waitFor(() => {
      expect(screen.getByText('Product not found')).toBeInTheDocument()
    })
  })

  test('handles fetch error', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'))

    render(<ViewProduct id="1" />)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to get product')
    })
  })

  test('handles non-ok response', async () => {
    fetch.mockResolvedValueOnce({
      ok: false
    })

    render(<ViewProduct id="1" />)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to get product')
    })
  })

  test('does not fetch when id is missing', () => {
    render(<ViewProduct id={null} />)
    expect(fetch).not.toHaveBeenCalled()
  })
})