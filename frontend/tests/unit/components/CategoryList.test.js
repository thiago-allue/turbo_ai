/**
 * Unit tests for the CategoryList component.
 * Ensures categories and their note counts render properly.
 */

import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import CategoryList from '../../../components/CategoryList';

describe('CategoryList Component', () => {
  const mockCategories = [
    {id: 1, name: 'Random Thoughts', color: '#FFCBCB', user: 2},
    {id: 2, name: 'School', color: '#FFF176', user: 2},
    {id: 3, name: 'Personal', color: '#AFC7BD', user: 2},
  ];

  const mockNotes = [
    {id: 10, title: 'Note 1', category: {id: 1}, updated_at: ''},
    {id: 11, title: 'Note 2', category: {id: 2}, updated_at: ''},
    {id: 12, title: 'Note 3', category: {id: 1}, updated_at: ''},
    {id: 13, title: 'Note 4', category: null, updated_at: ''},
  ];

  it('renders "All Categories" with correct count', () => {
    render(
      <CategoryList
        categories={mockCategories}
        notes={mockNotes}
        selectedCategory="all"
        onSelectCategory={() => {
        }}
      />
    );
    // "All Categories" should reflect total notes
    expect(screen.getByText('All Categories')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('renders each category with correct count', () => {
    render(
      <CategoryList
        categories={mockCategories}
        notes={mockNotes}
        selectedCategory="all"
        onSelectCategory={() => {
        }}
      />
    );
    // Random Thoughts => 2 notes
    expect(screen.getByText('Random Thoughts')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    // School => 1 note
    expect(screen.getByText('School')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();

    // Personal => 0 notes
    expect(screen.getByText('Personal')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('calls onSelectCategory when a category is clicked', () => {
    const mockSelect = jest.fn();
    render(
      <CategoryList
        categories={mockCategories}
        notes={mockNotes}
        selectedCategory="all"
        onSelectCategory={mockSelect}
      />
    );
    fireEvent.click(screen.getByText('School'));
    expect(mockSelect).toHaveBeenCalledWith('2');
  });
});
