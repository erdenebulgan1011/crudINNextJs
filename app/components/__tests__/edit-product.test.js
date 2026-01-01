import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EditProduct from '../edit-product'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush })
}))

jest.mock('../bread-crumb', () => {
  return function MockBreadCrumb() {
    return <div data-testid="breadcrumb">Breadcrumb</div>
  }
})

global.fetch = jest.fn()
window.alert = jest.fn()

describe('EditProduct Component', () => {
  beforeEach(() => {
    fetch.mockClear()
    mockPush.mockClear()
    window.alert.mockClear()
  })

  test('renders edit form', async () => {
    const mockProduct = {
      _id: '1',
      title: 'Product',
      description: 'Description',
      price: 100
    }

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ product: mockProduct })
    })

    render(<EditProduct id="1" />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Product')).toBeInTheDocument()
    })
  })

  test('updates product successfully', async () => {
    const user = userEvent.setup()
    const mockProduct = { _id: '1', title: 'Old', description: 'Old Desc', price: 50 }

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ product: mockProduct })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Product updated successfully' })
      })

    render(<EditProduct id="1" />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Old')).toBeInTheDocument()
    })

    const titleInput = screen.getByDisplayValue('Old')
    await user.clear(titleInput)
    await user.type(titleInput, 'New Title')

    const submitButton = screen.getByRole('button', { type: 'submit' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2)
      expect(window.alert).toHaveBeenCalledWith('Product updated successfully')
      expect(mockPush).toHaveBeenCalledWith('../')
    })
  })

  test('handles update error', async () => {
    const user = userEvent.setup()
    const mockProduct = { _id: '1', title: 'Product', description: 'Desc', price: 100 }

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ product: mockProduct })
      })
      .mockResolvedValueOnce({
        ok: false
      })

    render(<EditProduct id="1" />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Product')).toBeInTheDocument()
    })

    const submitButton = screen.getByRole('button', { type: 'submit' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to update product')
      expect(mockPush).not.toHaveBeenCalled()
    })
  })
})