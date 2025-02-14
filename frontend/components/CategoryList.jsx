/**
 * CategoryList component displaying a list of categories and their counts.
 * Allows toggling "All Categories" or individual categories.
 */

import React from 'react'

export default function CategoryList({categories, notes, selectedCategory, onSelectCategory}) {

  /**
   * Handles clicking on "All Categories".
   */
  const handleAllCategories = () => {
    onSelectCategory('all')
  }

  /**
   * Checks if the given category ID matches the currently selectedCategory.
   * @param {number} catId - The category ID to check.
   * @returns {boolean} True if selected, false otherwise.
   */
  const isSelected = (catId) => {
    return selectedCategory === catId.toString()
  }

  // Determine if "All Categories" is selected
  const allIsSelected = selectedCategory === 'all'

  // Count total notes
  const allCount = notes.length

  return (
    <div style={{width: '200px', padding: '20px'}}>
      <table style={{
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: '0 10px',
        whiteSpace: 'nowrap',
        lineHeight: '150%'
      }}>
        <tbody>
        <tr
          onClick={handleAllCategories}
          style={{
            cursor: 'pointer',
            fontWeight: allIsSelected ? 'bold' : 'normal'
          }}
        >
          <td style={{textAlign: 'left'}}>
            All Categories
          </td>
          <td style={{
            textAlign: 'right',
            paddingLeft: '45px',
            fontWeight: allIsSelected ? 'bold' : 'normal'
          }}>
            {allCount}
          </td>
        </tr>
        {categories.map(cat => {
          // Calculate how many notes belong to this category
          const count = notes.filter(n => n.category && n.category.id === cat.id).length
          const selected = isSelected(cat.id)
          return (
            <tr
              key={cat.id}
              onClick={() => onSelectCategory(cat.id.toString())}
              style={{
                cursor: 'pointer',
                fontWeight: selected ? 'bold' : 'normal'
              }}
            >
              <td style={{textAlign: 'left', display: 'flex', alignItems: 'center'}}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: cat.color,
                      marginRight: '8px'
                    }}
                  />
                {cat.name}
              </td>
              <td style={{
                textAlign: 'right',
                paddingLeft: '30px',
                fontWeight: selected ? 'bold' : 'normal'
              }}>
                {count}
              </td>
            </tr>
          )
        })}
        </tbody>
      </table>
    </div>
  )
}
