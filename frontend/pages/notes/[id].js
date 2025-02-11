import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import api from '../../services/api'
import { formatDate } from '../../utils/dateUtils'
import DropMenu from '../../components/DropMenu'

export default function NoteDetail() {
  const router = useRouter()
  const { id } = router.query
  const [note, setNote] = useState(null)
  const [categories, setCategories] = useState([])

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
    }
  }, [router])

  useEffect(() => {
    if (id) {
      fetchNote()
      fetchCategories()
    }
  }, [id])

  const fetchNote = async () => {
    try {
      const res = await api.getNote(id)
      setNote(res.data)
      setTitle(res.data.title)
      setContent(res.data.content)
      setCategoryId(res.data.category ? res.data.category.id.toString() : '')
    } catch (error) {
      console.error(error)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await api.getCategories()
      setCategories(res.data)
    } catch (error) {
      console.error(error)
    }
  }

  const updateNote = async (updatedFields) => {
    if (!note) return
    try {
      await api.updateNote(note.id, updatedFields)
    } catch (error) {
      console.error(error)
    }
  }

  const handleTitleChange = (e) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    updateNote({ title: newTitle })
  }

  const handleContentChange = (e) => {
    const newContent = e.target.value
    setContent(newContent)
    updateNote({ content: newContent })
  }

  const handleCategoryChange = (newCategoryId) => {
    setCategoryId(newCategoryId.toString())
    updateNote({ category_id: newCategoryId })
  }

  const handleClose = async () => {
    // If both title and content are empty, delete this note and go back
    if (!title.trim() && !content.trim()) {
      try {
        await api.deleteNote(note.id)
      } catch (err) {
        console.error(err)
      }
      router.push('/dashboard')
      return
    }

    // If one is empty but not the other, show a soft message
    if (!title.trim() || !content.trim()) {
      alert('Please, enter both Title and Contents of the Note')
      return
    }

    // Otherwise, if both are present, just go back to dashboard
    router.push('/dashboard')
  }

  if (!note) {
    return <div>Loading...</div>
  }

  // For color logic on the card border
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

  const noteCategory = categories.find(cat => cat.id === parseInt(categoryId))
  const cardColor = noteCategory?.color || '#fff'
  const borderColor = getDarkerColor(cardColor)

  // Outer container
  const outerContainerStyle = {
    width: '100vw',
    height: '100vh',
    margin: 0,
    padding: 0,
    backgroundColor: '#ffffff',
    position: 'relative',
    boxSizing: 'border-box'
  }

  // Inner container
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

  // Close button
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

  // DropMenu => moved from '81px' to '61px' for the top
  const dropMenuStyle = {
    position: 'absolute',
    top: '61px',
    left: '41px'
  }

  // Last edited label
  const lastEditedStyle = {
    position: 'absolute',
    top: '20px',
    right: '20px',
    margin: 0,
    fontSize: '0.9rem'
  }

  // Title => moved from (top: '102px', left: '80px') => (top: '52px', left: '30px')
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

  // Content => from (top: '162px', left: '80px') => (top: '112px', left: '30px')
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
