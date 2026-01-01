import { render, screen, waitFor } from '@testing-library/react'
import AllProducts from '../all-product'

// Mock DataTable component
jest.mock('../dataTable', () => {
  return function MockDataTable({ cols, rows, onRefresh }) {
    return (
      <div data-testid="data-table">
        <div data-testid="cols">{JSON.stringify(cols)}</div>
        <div data-testid="rows">{JSON.stringify(rows)}</div>
        <button onClick={onRefresh} data-testid="refresh-button">Refresh</button>
      </div>
    )
  }
})

  // Mock fetch
  global.fetch = jest.fn()
  
  describe('AllProducts Component', () => {
    const mockProducts = [
      {
        _id: '1',
        title: 'Product 1',
        description: 'Description 1',
        price: 100
      },
      {
        _id: '2',
        title: 'Product 2',
        description: 'Description 2',
        price: 200
      }
    ]
  
    beforeEach(() => {
      fetch.mockClear()
    })
  
    test('renders DataTable component', () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ products: [] })
      })
  
      render(<AllProducts />)
      
      expect(screen.getByTestId('data-table')).toBeInTheDocument()
    })
  
    test('fetches products on mount', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ products: mockProducts })
      })
  
      render(<AllProducts />)
  
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/')
      })
    })
  
    test('passes correct columns to DataTable', () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ products: [] })
      })
  
      render(<AllProducts />)
      
      const colsElement = screen.getByTestId('cols')
      expect(colsElement.textContent).toContain('ID')
      expect(colsElement.textContent).toContain('TITLE')
      expect(colsElement.textContent).toContain('DESCRIPTION')
      expect(colsElement.textContent).toContain('PRICE')
    })
  
    test('passes fetched products to DataTable', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ products: mockProducts })
      })
  
      render(<AllProducts />)
  
      await waitFor(() => {
        const rowsElement = screen.getByTestId('rows')
        expect(rowsElement.textContent).toContain('Product 1')
        expect(rowsElement.textContent).toContain('Product 2')
      })
    })
  
    test('handles fetch error gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))
  
      render(<AllProducts />)
  
      await waitFor(() => {
        expect(fetch).toHaveBeenCalled()
      })
  
      // Component should still render without crashing
      expect(screen.getByTestId('data-table')).toBeInTheDocument()
    })
  
    test('onRefresh function refetches products', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ products: mockProducts })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ products: [{ _id: '3', title: 'New Product' }] })
        })
  
      render(<AllProducts />)
  
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1)
      })
  
      const refreshButton = screen.getByTestId('refresh-button')
      refreshButton.click()
  
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(2)
      })
    })
  })