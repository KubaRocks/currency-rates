import React from 'react';
import { render, screen } from '@testing-library/react';
import { App } from './App';

test('renders currencies', () => {
  render(<App />);
  const usdElement = screen.getByText(/USD/i);
  expect(usdElement).toBeInTheDocument();
  const eurElement = screen.getByText(/EUR/i);
  expect(eurElement).toBeInTheDocument();
});
