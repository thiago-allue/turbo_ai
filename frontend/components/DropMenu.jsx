/**
 * DropMenu component for selecting a category from a dropdown.
 * Shows the category color and name, plus an option to create a new category.
 */

import React, {useState} from 'react'
import {DownOutlined} from '@ant-design/icons'
import {Modal, Input, Radio, message} from 'antd'
import api from '../services/api'

export default function DropMenu({categories, selectedCategoryId, onCategoryChange, onRefreshCategories}) {
  /**
   * categories: array of existing category objects
   * selectedCategoryId: the current category id (number) or '' string
   * onCategoryChange: callback to change selected category id
   * onRefreshCategories: callback to trigger parent to refresh categories
   */

  // Controls whether the dropdown is open
  const [open, setOpen] = useState(false)

  // State for creating a new category
  const [newCatModalVisible, setNewCatModalVisible] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState('#F44336')

  // Hardcoded color options
  const colorOptions = [
    '#F44336',
    '#E91E63',
    '#9C27B0',
    '#673AB7',
    '#3F51B5',
    '#009688'
  ]

  /**
   * Toggle the dropdown open/close.
   */
  const handleToggle = () => {
    setOpen(!open)
  }

  /**
   * Select a category.
   */
  const handleSelect = (id) => {
    onCategoryChange(id)
    setOpen(false)
  }

  /**
   * Show modal to create a new category.
   */
  const handleShowNewCatModal = () => {
    setNewCategoryName('')
    setNewCategoryColor('#F44336')
    setNewCatModalVisible(true)
    setOpen(false)
  }

  /**
   * Create new category in the backend.
   */
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      message.error('Category name is required.')
      return
    }

    try {
      const response = await api.createCategory({
        name: newCategoryName.trim(),
        color: newCategoryColor
      })
      const newCat = response.data
      message.success('New category created.')

      setNewCatModalVisible(false)
      setNewCategoryName('')
      setNewCategoryColor('#F44336')

      // Refresh categories from parent, then select the new category
      if (onRefreshCategories) {
        await onRefreshCategories()
      }
      if (newCat && newCat.id) {
        onCategoryChange(newCat.id)
      }
    } catch (error) {
      console.error(error)
      message.error('Failed to create new category.')
    }
  }

  // Find the currently selected category
  const selectedCat = categories.find(cat => cat.id === parseInt(selectedCategoryId)) || {}
  const selectedCatName = selectedCat.name || 'Select Category'
  const selectedCatColor = selectedCat.color || '#ccc'

  return (
    <div style={{position: 'relative', display: 'inline-block'}}>
      {/* Modal for creating a new category */}
      <Modal
        title="Create New Category"
        open={newCatModalVisible}
        onOk={handleCreateCategory}
        onCancel={() => setNewCatModalVisible(false)}
        okText="Create"
      >
        <div style={{marginBottom: '10px'}}>
          <Input
            placeholder="Category Name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
        </div>
        <div style={{marginBottom: '10px'}}>
          <Radio.Group
            onChange={(e) => setNewCategoryColor(e.target.value)}
            value={newCategoryColor}
          >
            {colorOptions.map((color) => (
              <Radio
                key={color}
                value={color}
                style={{display: 'inline-block', marginRight: '15px', marginBottom: '10px'}}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    border: '1px solid #ccc',
                    verticalAlign: 'middle'
                  }}
                />
              </Radio>
            ))}
          </Radio.Group>
        </div>
      </Modal>

      {/* Main button showing the selected category */}
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
          backgroundColor: selectedCatColor
        }}></span>
        {selectedCatName}
        <DownOutlined style={{marginLeft: '8px'}}/>
      </button>

      {/* Dropdown list */}
      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          width: '220px',
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

          {/* Separator */}
          <div
            style={{
              margin: '8px 0',
              borderTop: '1px solid #ccc'
            }}
          />

          {/* "+ Create New Category" entry */}
          <div
            onClick={handleShowNewCatModal}
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              color: '#1890ff',
              fontWeight: 'bold'
            }}
          >
            + Create New Category
          </div>
        </div>
      )}
    </div>
  )
}
