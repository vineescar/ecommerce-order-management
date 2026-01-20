import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from './Input';

describe('Input', () => {
  it('renders input without label', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders input with label', () => {
    render(<Input label="Email" placeholder="Enter email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
  });

  it('generates id from label', () => {
    render(<Input label="First Name" />);
    const input = screen.getByLabelText('First Name');
    expect(input).toHaveAttribute('id', 'first-name');
  });

  it('uses provided id over generated one', () => {
    render(<Input label="Email" id="custom-email-id" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('id', 'custom-email-id');
  });

  it('displays error message', () => {
    render(<Input label="Email" error="Email is required" />);
    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  it('applies error styles when error is present', () => {
    render(<Input label="Email" error="Email is required" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveClass('border-red-500');
  });

  it('does not apply error styles when no error', () => {
    render(<Input label="Email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveClass('border-gray-300');
    expect(input).not.toHaveClass('border-red-500');
  });

  it('handles user input', async () => {
    render(<Input label="Name" />);
    const input = screen.getByLabelText('Name');

    await userEvent.type(input, 'John Doe');
    expect(input).toHaveValue('John Doe');
  });

  it('calls onChange when typing', async () => {
    const handleChange = vi.fn();
    render(<Input label="Name" onChange={handleChange} />);
    const input = screen.getByLabelText('Name');

    await userEvent.type(input, 'A');
    expect(handleChange).toHaveBeenCalled();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Input label="Email" disabled />);
    const input = screen.getByLabelText('Email');
    expect(input).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<Input label="Email" className="custom-class" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveClass('custom-class');
  });

  it('forwards ref to input element', () => {
    const ref = vi.fn();
    render(<Input label="Email" ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });
});
