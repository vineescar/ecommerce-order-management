import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Alert from './Alert';

describe('Alert', () => {
  it('renders error alert with message', () => {
    render(<Alert type="error" message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('✕')).toBeInTheDocument();
  });

  it('renders success alert with message', () => {
    render(<Alert type="success" message="Operation successful" />);
    expect(screen.getByText('Operation successful')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('renders warning alert with message', () => {
    render(<Alert type="warning" message="Please be careful" />);
    expect(screen.getByText('Please be careful')).toBeInTheDocument();
    expect(screen.getByText('⚠')).toBeInTheDocument();
  });

  it('renders info alert with message', () => {
    render(<Alert type="info" message="Here is some info" />);
    expect(screen.getByText('Here is some info')).toBeInTheDocument();
    expect(screen.getByText('ℹ')).toBeInTheDocument();
  });

  it('applies correct styles for error type', () => {
    const { container } = render(<Alert type="error" message="Error" />);
    const alert = container.firstChild;
    expect(alert).toHaveClass('bg-red-50', 'border-red-200', 'text-red-700');
  });

  it('applies correct styles for success type', () => {
    const { container } = render(<Alert type="success" message="Success" />);
    const alert = container.firstChild;
    expect(alert).toHaveClass('bg-green-50', 'border-green-200', 'text-green-700');
  });

  it('does not render close button when onClose is not provided', () => {
    render(<Alert type="info" message="Info" />);
    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
  });

  it('renders close button when onClose is provided', () => {
    const handleClose = vi.fn();
    render(<Alert type="info" message="Info" onClose={handleClose} />);
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const handleClose = vi.fn();
    render(<Alert type="info" message="Info" onClose={handleClose} />);

    await userEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
