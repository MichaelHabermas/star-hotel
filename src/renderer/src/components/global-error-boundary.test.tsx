import { render, screen } from '@testing-library/react';
import type { JSX } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { GlobalErrorBoundary } from './global-error-boundary';

function Bomb(): JSX.Element {
  throw new Error('boundary test throw');
}

describe('GlobalErrorBoundary', () => {
  it('shows accessible fallback when a child throws', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <GlobalErrorBoundary>
        <Bomb />
      </GlobalErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/boundary test throw/i)).toBeInTheDocument();

    spy.mockRestore();
  });
});
