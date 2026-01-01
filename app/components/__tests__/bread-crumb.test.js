import { render, screen } from '@testing-library/react'
import BreadCrumb from '../bread-crumb'

jest.mock('next/link', () => {
  return ({ children, href, className }) => (
    <a href={href} className={className}>{children}</a>
  )
})

describe('BreadCrumb Component', () => {
  test('renders breadcrumb links', () => {
    const lists = [
      { title: 'Home', url: '/' },
      { title: 'Products', url: '/products' }
    ]

    render(<BreadCrumb lists={lists} />)
    
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Products')).toBeInTheDocument()
  })

  test('renders empty when no lists provided', () => {
    render(<BreadCrumb lists={[]} />)
    expect(screen.queryByText('Home')).not.toBeInTheDocument()
  })

  test('renders with active class when active is true', () => {
    const lists = [
      { title: 'Home', url: '/', active: true },
      { title: 'Products', url: '/products' }
    ]

    render(<BreadCrumb lists={lists} />)
    const homeLink = screen.getByText('Home').closest('a')
    expect(homeLink).toHaveClass('active')
  })

  test('renders without active class when active is false', () => {
    const lists = [
      { title: 'Home', url: '/', active: false },
      { title: 'Products', url: '/products' }
    ]

    render(<BreadCrumb lists={lists} />)
    const homeLink = screen.getByText('Home').closest('a')
    expect(homeLink).not.toHaveClass('active')
  })

  test('renders with default empty array when lists not provided', () => {
    render(<BreadCrumb />)
    expect(screen.queryByText('Home')).not.toBeInTheDocument()
  })
})