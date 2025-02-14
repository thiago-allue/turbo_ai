/**
 * Note detail page for viewing and editing a single note.
 * Allows changing title, content, and category. Provides a close (return) button.
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import api from '../../services/api'
import { formatDate } from '../../utils/dateUtils'
import DropMenu from '../../components/DropMenu'
import { message } from 'antd'

export default function NoteDetail() {
  const router = useRouter()
  const { id } = router.query

  // States for note data
  const [note, setNote] = useState(null)
  const [categories, setCategories] = useState([])

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState('')

  /**
   * Ensure user is logged in on mount, otherwise redirect.
   */
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
    }
  }, [router])

  /**
   * Fetch the note and categories when the note ID is known.
   */
  useEffect(() => {
    if (id) {
      fetchNote()
      fetchCategories()
    }
  }, [id])

  /**
   * Retrieve a single note by ID from the API.
   */
  const fetchNote = async () => {
    try {
      const res = await api.getNote(id)
      setNote(res.data)
      setTitle(res.data.title)
      setContent(res.data.content)
      setCategoryId(res.data.category ? res.data.category.id.toString() : '')
    } catch (error) {
      console.error(error)
      message.error('Failed to load the note.')
    }
  }

  /**
   * Retrieve all categories from the API.
   */
  const fetchCategories = async () => {
    try {
      const res = await api.getCategories()
      setCategories(res.data)
    } catch (error) {
      console.error(error)
      message.error('Failed to load categories.')
    }
  }

  /**
   * Sends an update request to the API whenever a field is changed.
   * @param {Object} updatedFields - The fields to update (title, content, category_id).
   */
  const updateNote = async (updatedFields) => {
    if (!note) return
    try {
      await api.updateNote(note.id, updatedFields)
    } catch (error) {
      console.error(error)
      message.error('Failed to update the note.')
    }
  }

  /**
   * Title change handler. Calls updateNote immediately.
   */
  const handleTitleChange = (e) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    updateNote({ title: newTitle })
  }

  /**
   * Content change handler. Calls updateNote immediately.
   */
  const handleContentChange = (e) => {
    const newContent = e.target.value
    setContent(newContent)
    updateNote({ content: newContent })
  }

  /**
   * Category change handler. Calls updateNote with new category ID.
   */
  const handleCategoryChange = (newCategoryId) => {
    setCategoryId(newCategoryId.toString())
    updateNote({ category_id: newCategoryId })
  }

  /**
   * Handles the close button. If title/content are both empty, delete the note.
   * Otherwise checks if either is empty, ask user to fill it. Else goes back to dashboard.
   */
  const handleClose = async () => {
    if (!title.trim() && !content.trim()) {
      try {
        await api.deleteNote(note.id)
      } catch (err) {
        console.error(err)
        message.error('Failed to delete an empty note.')
      }
      router.push('/dashboard')
      return
    }

    if (!title.trim() || !content.trim()) {
      alert('Please, enter both Title and Contents of the Note')
      return
    }

    router.push('/dashboard')
  }

  /**
   * Return a darker border color for the card based on the category's color.
   * @param {string} hexColor - The color code of the category.
   * @returns {string} - A darker or distinct color code.
   */
  const getDarkerColor = (hexColor) => {
    switch (hexColor) {
      case '#FFCBCB':
        return 'darkred'
      case '#FFF176':
        return 'goldenrod'
      case '#AFC7BD':
        return 'darkgreen'
      default:
        return '#333333'
    }
  }

  if (!note) {
    return <div>Loading...</div>
  }

  const noteCategory = categories.find(cat => cat.id === parseInt(categoryId))
  const cardColor = noteCategory?.color || '#fff'
  const borderColor = getDarkerColor(cardColor)

  const outerContainerStyle = {
    width: '100vw',
    height: '100vh',
    margin: 0,
    padding: 0,
    backgroundColor: '#ffffff',
    position: 'relative',
    boxSizing: 'border-box'
  }

  const innerContainerStyle = {
    position: 'absolute',
    top: '101px',
    bottom: '81px',
    left: '41px',
    right: '41px',
    backgroundColor: cardColor,
    boxSizing: 'border-box',
    border: `3px solid ${borderColor}`,
    borderRadius: '8px'
  }

  const closeButtonStyle = {
    position: 'absolute',
    top: '61px',
    right: '41px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    border: 'none',
    padding: '5px 10px',
    fontSize: '24px',
    color: 'grey'
  }

  const dropMenuStyle = {
    position: 'absolute',
    top: '61px',
    left: '41px'
  }

  const lastEditedStyle = {
    position: 'absolute',
    top: '20px',
    right: '20px',
    margin: 0,
    fontSize: '0.9rem'
  }

  const titleInputStyle = {
    position: 'absolute',
    top: '52px',
    left: '30px',
    width: 'calc(100% - 160px)',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'black',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    fontFamily: 'Inria Serif'
  }

  const contentTextareaStyle = {
    position: 'absolute',
    top: '112px',
    left: '30px',
    width: 'calc(100% - 160px)',
    height: 'calc(100% - 200px)',
    fontSize: '1rem',
    color: 'black',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    resize: 'none',
    fontFamily: 'Inter'
  }

  return (
    <div style={outerContainerStyle}>
      <button style={closeButtonStyle} onClick={handleClose}>
        X
      </button>

      <div style={dropMenuStyle}>
        <DropMenu
          categories={categories}
          selectedCategoryId={categoryId}
          onCategoryChange={handleCategoryChange}
        />
      </div>

      <div style={innerContainerStyle}>
        <p style={lastEditedStyle}>
          Last edited: {formatDate(note.updated_at)}
        </p>

        <input
          style={titleInputStyle}
          value={title}
          onChange={handleTitleChange}
          placeholder='Note Title'
        />

        <textarea
          style={contentTextareaStyle}
          value={content}
          onChange={handleContentChange}
          placeholder='Pour your heart out...'
        />
      </div>
    </div>
  )
}
