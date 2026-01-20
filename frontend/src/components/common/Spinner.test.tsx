import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Spinner from './Spinner';

describe('Spinner', () => {
  it('renders spinner with default medium size', () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('h-8', 'w-8');
  });

  it('renders spinner with small size', () => {
    const { container } = render(<Spinner size="sm" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('h-4', 'w-4');
  });

  it('renders spinner with large size', () => {
    const { container } = render(<Spinner size="lg" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('h-12', 'w-12');
  });

  it('applies animation class', () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('animate-spin');
  });

  it('applies custom className', () => {
    const { container } = render(<Spinner className="my-custom-class" />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('my-custom-class');
  });

  it('has correct color class', () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('text-blue-600');
  });
});
