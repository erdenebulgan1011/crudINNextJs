import { render, screen } from '@testing-library/react'
import DeleteProduct from '../delete-product'

describe('DeleteProduct Component', () => {
  test('renders DeleteProduct text', () => {
    render(<DeleteProduct />)
    expect(screen.getByText('DeleteProduct')).toBeInTheDocument()
  })
})