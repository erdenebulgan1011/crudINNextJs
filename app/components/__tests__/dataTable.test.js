import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import DataTable from '../dataTable'

// Mock fetch
global.fetch = jest.fn()

describe('DataTable Component', () => {
  const mockCols = ['ID', 'TITLE', 'DESCRIPTION', 'PRICE']
  const mockRows = [
    {
      _id: '1',
      title: 'Test Product',
      description: 'This is a test product description',
      price: 100
    },
    {
      _id: '2',
      title: 'Another Product',
      description: 'Another product description here',
      price: 200
    }
  ]

  beforeEach(() => {
    fetch.mockClear()
    window.confirm = jest.fn(() => true)
    window.alert = jest.fn()
  })

  test('renders table headers correctly', () => {
    render(<DataTable cols={mockCols} rows={[]} />)
    
    expect(screen.getByText('ID')).toBeInTheDocument()
    expect(screen.getByText('TITLE')).toBeInTheDocument()
    expect(screen.getByText('DESCRIPTION')).toBeInTheDocument()
    expect(screen.getByText('PRICE')).toBeInTheDocument()
  })

  test('renders product rows correctly', () => {
    render(<DataTable cols={mockCols} rows={mockRows} />)
    
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('Another Product')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('200')).toBeInTheDocument()
  })

  test('truncates long descriptions', () => {
    render(<DataTable cols={mockCols} rows={mockRows} />)
    
    const description = screen.getByText(/This is a test product description/)
    expect(description).toBeInTheDocument()
  })

  test('renders View, Edit, and Trash buttons for each product', () => {
    render(<DataTable cols={mockCols} rows={mockRows} />)
    
    const viewButtons = screen.getAllByText('View')
    const editButtons = screen.getAllByText('Edit')
    const trashButtons = screen.getAllByText('Trash')
    
    expect(viewButtons).toHaveLength(2)
    expect(editButtons).toHaveLength(2)
    expect(trashButtons).toHaveLength(2)
  })

  test('View button links to correct URL', () => {
    render(<DataTable cols={mockCols} rows={mockRows} />)
    
    const viewLinks = screen.getAllByText('View')
    expect(viewLinks[0].closest('a')).toHaveAttribute('href', '/view/1')
    expect(viewLinks[1].closest('a')).toHaveAttribute('href', '/view/2')
  })

  test('Edit button links to correct URL', () => {
    render(<DataTable cols={mockCols} rows={mockRows} />)
    
    const editLinks = screen.getAllByText('Edit')
    expect(editLinks[0].closest('a')).toHaveAttribute('href', '/edit/1')
    expect(editLinks[1].closest('a')).toHaveAttribute('href', '/edit/2')
  })

  test('calls delete API when Trash button is clicked', async () => {
    const mockOnRefresh = jest.fn()
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Product deleted successfully' })
    })

    render(<DataTable cols={mockCols} rows={mockRows} onRefresh={mockOnRefresh} />)
    
    const trashButtons = screen.getAllByText('Trash')
    fireEvent.click(trashButtons[0])

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/1', {
        method: 'DELETE'
      })
    })

    await waitFor(() => {
      expect(mockOnRefresh).toHaveBeenCalled()
    })
  })

  test('does not delete if user cancels confirmation', async () => {
    window.confirm = jest.fn(() => false)
    const mockOnRefresh = jest.fn()

    render(<DataTable cols={mockCols} rows={mockRows} onRefresh={mockOnRefresh} />)
    
    const trashButtons = screen.getAllByText('Trash')
    fireEvent.click(trashButtons[0])

    await waitFor(() => {
      expect(fetch).not.toHaveBeenCalled()
      expect(mockOnRefresh).not.toHaveBeenCalled()
    })
  })

  test('shows error alert when delete fails', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Delete failed' })
    })

    render(<DataTable cols={mockCols} rows={mockRows} />)
    
    const trashButtons = screen.getAllByText('Trash')
    fireEvent.click(trashButtons[0])

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Error deleting')
    })
  })

  test('handles empty rows array', () => {
    render(<DataTable cols={mockCols} rows={[]} />)
    
    expect(screen.getByText('ID')).toBeInTheDocument()
    expect(screen.queryByText('Test Product')).not.toBeInTheDocument()
  })
  test('handles description that is null or undefined', () => {
    const rowsWithNullDesc = [
      {
        _id: '1',
        title: 'Product',
        description: null,
        price: 100
      }
    ]

    render(<DataTable cols={mockCols} rows={rowsWithNullDesc} />)
    
    // Should not crash when description is null
    expect(screen.getByText('Product')).toBeInTheDocument()
  })

  test('handles description shorter than 40 characters', () => {
    const rowsShortDesc = [
      {
        _id: '1',
        title: 'Product',
        description: 'Short',
        price: 100
      }
    ]

    render(<DataTable cols={mockCols} rows={rowsShortDesc} />)
    
    expect(screen.getByText(/Short\.\.\./)).toBeInTheDocument()
  })
  test('does not call onRefresh when not provided', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Product deleted successfully' })
    })

    render(<DataTable cols={mockCols} rows={mockRows} />)
    
    const trashButtons = screen.getAllByText('Trash')
    fireEvent.click(trashButtons[0])

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled()
      expect(window.alert).toHaveBeenCalled()
    })
  })
  test('handles description that is empty string', () => {
    const rowsWithEmptyDesc = [
      {
        _id: '1',
        title: 'Product',
        description: '',
        price: 100
      }
    ]
  
    render(<DataTable cols={mockCols} rows={rowsWithEmptyDesc} />)
    
    expect(screen.getByText('Product')).toBeInTheDocument()
    // Empty description should render empty string
  })
})