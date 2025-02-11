import React, { useState } from 'react'
import { DownOutlined } from '@ant-design/icons'

export default function DropMenu({ categories, selectedCategoryId, onCategoryChange }) {
  const [open, setOpen] = useState(false)

  const handleToggle = () => {
    setOpen(!open)
  }

  const handleSelect = (id) => {
    onCategoryChange(id)
    setOpen(false)
  }

  const selectedCategory = categories.find(cat => cat.id === parseInt(selectedCategoryId)) || {}

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={handleToggle}
        style={{
          background: 'white',
          padding: '8px 16px',
          cursor: 'pointer',
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}
      >
        <span style={{
          marginRight: '8px',
          display: 'inline-block',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: selectedCategory.color || '#ccc'
        }}></span>
        {selectedCategory.name || 'Select Category'}
        <DownOutlined style={{ marginLeft: '8px' }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          width: '200px',
          zIndex: 9999
        }}>
          {categories.map(cat => (
            <div
              key={cat.id}
              onClick={() => handleSelect(cat.id)}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <span style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: cat.color,
                marginRight: '8px'
              }}></span>
              {cat.name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
