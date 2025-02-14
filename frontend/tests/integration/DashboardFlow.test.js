/**
 * A simple integration test that simulates:
 * 1. Rendering a dashboard page
 * 2. Mocking API calls (axios)
 * 3. Checking if categories & notes are displayed
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardPage from '../../../pages/dashboard';
import api from '../../../services/api';
import { useRouter } from 'next/router';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../../services/api', () => ({
  getCategories: jest.fn(),
  getNotes: jest.fn(),
  createNote: jest.fn(),
}));

describe('DashboardPage Integration', () => {
  beforeEach(() => {
    // Mock localStorage token
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key) => {
          if (key === 'token') return 'fake-token';
          if (key === 'first_name') return 'TestUser';
          return null;
        }),
      },
      writable: true,
    });

    useRouter.mockReturnValue({
      push: jest.fn(),
    });

    api.getCategories.mockResolvedValue({ data: [
      { id: 1, name: 'Random Thoughts', color: '#FFCBCB', user: 2 },
      { id: 2, name: 'School', color: '#FFF176', user: 2 },
      { id: 3, name: 'Personal', color: '#AFC7BD', user: 2 },
    ]});

    api.getNotes.mockResolvedValue({ data: [
      { id: 101, title: 'Sample Note', content: 'Note content', category: { id: 1, name: 'Random Thoughts', color: '#FFCBCB' }, updated_at: '2025-02-12T12:00:00Z' },
    ]});
  });

  it('renders categories and notes', async () => {
    render(<DashboardPage />);
    // Wait for categories to load
    await waitFor(() => {
      expect(api.getCategories).toHaveBeenCalled();
    });

    expect(screen.getByText('All Categories')).toBeInTheDocument();
    expect(screen.getByText('Random Thoughts')).toBeInTheDocument();
    expect(screen.getByText('School')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();

    // Wait for notes to load
    await waitFor(() => {
      expect(api.getNotes).toHaveBeenCalled();
    });

    // Sample note should be displayed
    expect(screen.getByText('Sample Note')).toBeInTheDocument();
    // The date might be "Yesterday" if time is "2025-02-13"
    expect(screen.getByText(/Random Thoughts/)).toBeInTheDocument();
  });
};
