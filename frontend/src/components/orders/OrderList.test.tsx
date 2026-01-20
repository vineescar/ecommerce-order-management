import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OrderList from './OrderList';
import { Order } from '../../types';

const mockOrders: Order[] = [
  {
    id: 1,
    order_description: 'Office Supplies Order',
    created_at: '2024-01-15T10:30:00.000Z',
    product_count: 3,
  },
  {
    id: 2,
    order_description: 'Electronics Order',
    created_at: '2024-01-16T14:45:00.000Z',
    product_count: 1,
  },
];

describe('OrderList', () => {
  const defaultProps = {
    orders: mockOrders,
    isLoading: false,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    searchTerm: '',
  };

  it('renders loading spinner when isLoading is true', () => {
    render(<OrderList {...defaultProps} isLoading={true} />);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders empty state when no orders exist', () => {
    render(<OrderList {...defaultProps} orders={[]} />);
    expect(screen.getByText('No orders found')).toBeInTheDocument();
    expect(screen.getByText('Create your first order to get started')).toBeInTheDocument();
  });

  it('renders orders table with correct headers', () => {
    render(<OrderList {...defaultProps} />);
    expect(screen.getByText('Order ID')).toBeInTheDocument();
    expect(screen.getByText('Order Description')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Created At')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('renders order data correctly', () => {
    render(<OrderList {...defaultProps} />);
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('Office Supplies Order')).toBeInTheDocument();
    expect(screen.getByText('3 products')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
    expect(screen.getByText('Electronics Order')).toBeInTheDocument();
    expect(screen.getByText('1 product')).toBeInTheDocument();
  });

  it('displays singular "product" for count of 1', () => {
    render(<OrderList {...defaultProps} />);
    expect(screen.getByText('1 product')).toBeInTheDocument();
  });

  it('displays plural "products" for count greater than 1', () => {
    render(<OrderList {...defaultProps} />);
    expect(screen.getByText('3 products')).toBeInTheDocument();
  });

  it('renders Edit and Delete buttons for each order', () => {
    render(<OrderList {...defaultProps} />);
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    expect(editButtons).toHaveLength(2);
    expect(deleteButtons).toHaveLength(2);
  });

  it('calls onEdit with correct order when Edit is clicked', async () => {
    const onEdit = vi.fn();
    render(<OrderList {...defaultProps} onEdit={onEdit} />);

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    await userEvent.click(editButtons[0]);

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith(mockOrders[0]);
  });

  it('calls onDelete with correct order id when Delete is clicked', async () => {
    const onDelete = vi.fn();
    render(<OrderList {...defaultProps} onDelete={onDelete} />);

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await userEvent.click(deleteButtons[1]);

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(2);
  });

  it('filters orders based on searchTerm by id', () => {
    render(<OrderList {...defaultProps} searchTerm="1" />);
    expect(screen.getByText('Office Supplies Order')).toBeInTheDocument();
    expect(screen.queryByText('Electronics Order')).not.toBeInTheDocument();
  });

  it('filters orders based on searchTerm by description', () => {
    render(<OrderList {...defaultProps} searchTerm="electronics" />);
    expect(screen.getByText('Electronics Order')).toBeInTheDocument();
    expect(screen.queryByText('Office Supplies Order')).not.toBeInTheDocument();
  });

  it('shows no matching orders message when search has no results', () => {
    render(<OrderList {...defaultProps} searchTerm="nonexistent" />);
    expect(screen.getByText('No matching orders found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search criteria')).toBeInTheDocument();
  });

  it('is case insensitive when filtering', () => {
    render(<OrderList {...defaultProps} searchTerm="OFFICE" />);
    expect(screen.getByText('Office Supplies Order')).toBeInTheDocument();
  });
});
