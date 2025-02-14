/**
 * Dashboard page where the user can view, create, and manage notes.
 * Displays categories on the left and notes in a grid on the right.
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import CategoryList from '../components/CategoryList'
import NoteCard from '../components/NoteCard'
import api from '../services/api'
import NewNoteButton from '../components/NewNoteButton'

import { Menu, Dropdown, Modal, message, Input, Spin } from 'antd'
import { UserOutlined } from '@ant-design/icons'

const { confirm } = Modal

export default function DashboardPage() {

  // Next.js router for navigation
  const router = useRouter()

  // Local states for categories, notes, etc.
  const [categories, setCategories] = useState([])
  const [notes, setNotes] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [token, setToken] = useState('')
  const [userName, setUserName] = useState('')

  // State for controlling the "Populate with LLM" modal
  const [isPopulateModalVisible, setIsPopulateModalVisible] = useState(false)
  const [inspirationSubject, setInspirationSubject] = useState('')
  const [isPopulating, setIsPopulating] = useState(false)

  /**
   * On mount, check for the auth token. If not present, redirect to login.
   */
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (!storedToken) {
      router.push('/')
      return
    }
    setToken(storedToken)

    let rawName = localStorage.getItem('first_name') || ''
    rawName = rawName.trim()
    if (rawName) {
      const firstWord = rawName.split(' ')[0]
      const capitalized = firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase()
      setUserName(capitalized)
    }
  }, [router])

  /**
   * Fetch categories and notes if a valid token is present.
   */
  useEffect(() => {
    if (token) {
      fetchCategories()
      fetchNotes()
    }
  }, [token])

  /**
   * Retrieves the user's categories from the API.
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
   * Retrieves the user's notes from the API.
   */
  const fetchNotes = async () => {
    try {
      const res = await api.getNotes()
      setNotes(res.data)
    } catch (error) {
      console.error(error)
      message.error('Failed to load notes.')
    }
  }

  /**
   * Handler when a category is selected from the list.
   * @param {string} cat - The category ID or 'all'
   */
  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat)
  }

  /**
   * Creates a new note under a default or "Random Thoughts" category.
   */
  const handleCreateNote = async () => {
    try {
      let randomThoughts = categories.find(cat => cat.name.toLowerCase() === 'random thoughts')
      if (!randomThoughts && categories.length > 0) {
        randomThoughts = categories[0]
      }
      if (!randomThoughts) return

      const res = await api.createNote({ category_id: randomThoughts.id })
      router.push(`/notes/${res.data.id}`)
    } catch (error) {
      console.error(error)
      message.error('Failed to create a new note.')
    }
  }

  /**
   * Logs out the current user after confirmation.
   */
  const handleLogout = () => {
    confirm({
      title: 'Logout',
      content: 'Are you sure you want to logout?',
      onOk: async () => {
        try {
          await api.logout()
          message.success('Logged out successfully.')
        } catch (error) {
          console.error(error)
          message.error('Failed to logout.')
        }
        localStorage.removeItem('token')
        localStorage.removeItem('first_name')
        router.push('/')
      }
    })
  }

  /**
   * Callback to remove a deleted note from the UI.
   * @param {number} noteId - ID of the note that was deleted.
   */
  const handleNoteDelete = (noteId) => {
    setNotes(prev => prev.filter(n => n.id !== noteId))
  }

  /**
   * Shows the "Populate with LLM" modal.
   */
  const showPopulateModal = () => {
    setInspirationSubject('')
    setIsPopulateModalVisible(true)
  }

  /**
   * Executes the "Populate with LLM" request to the backend.
   */
  const handlePopulateOk = async () => {
    setIsPopulating(true)
    try {
      const response = await fetch('http://localhost:8000/api/v1/populate_llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + token
        },
        body: JSON.stringify({ subject: inspirationSubject })
      })

      if (!response.ok) {
        const errData = await response.json()
        message.error('Failed to populate: ' + (errData.error || response.status))
        setIsPopulating(false)
        return
      }

      const data = await response.json()
      await fetchNotes()
      message.success(`Successfully created Notes inspired by "${inspirationSubject}".`)
    } catch (error) {
      console.error(error)
      message.error('Failed to populate with LLM.')
    } finally {
      setIsPopulating(false)
      setIsPopulateModalVisible(false)
    }
  }

  /**
   * Hides the "Populate with LLM" modal without creating notes.
   */
  const handlePopulateCancel = () => {
    setIsPopulateModalVisible(false)
  }

  /**
   * Clears all notes after a user confirmation.
   */
  const clearAllNotes = () => {
    confirm({
      title: 'Clear all notes',
      content: 'Are you sure you want to clear all notes?',
      onOk: async () => {
        try {
          for (const n of notes) {
            await api.deleteNote(n.id)
          }
          fetchNotes()
          message.success('All notes cleared!')
        } catch (error) {
          console.error(error)
          message.error('Failed to clear notes.')
        }
      }
    })
  }

  /**
   * Navigates to the profile editing page.
   */
  const handleEditProfile = () => {
    router.push('/profile')
  }

  /**
   * Defines the menu items for the dropdown (edit profile, populate, clear, logout).
   */
  const menuItems = [
    {
      key: 'profile',
      label: 'Edit Profile',
      onClick: handleEditProfile
    },
    {
      key: 'submenu',
      label: 'Dashboard',
      children: [
        {
          key: 'populate',
          label: 'Populate with LLM',
          onClick: showPopulateModal
        },
        {
          key: 'clear',
          label: 'Clear',
          onClick: clearAllNotes
        }
      ]
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: 'Logout',
      onClick: handleLogout
    }
  ]

  /**
   * Filters notes by the selected category. If 'all', return all notes.
   */
  const filteredNotes = selectedCategory === 'all'
    ? notes
    : notes.filter(note => note.category && note.category.id === parseInt(selectedCategory))

  return (
    <div style={{ display: 'flex', height: '100vh', position: 'relative' }}>

      {/* Modal for "Populate with LLM" feature */}
      <Modal
        title="Give me something for me get inspired"
        open={isPopulateModalVisible}
        onOk={handlePopulateOk}
        onCancel={handlePopulateCancel}
        okText="Create Notes"
        cancelText="Cancel"
        maskClosable={false}
      >
        {isPopulating ? (
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Spin tip="Creating notes, please wait..." />
          </div>
        ) : (
          <Input
            placeholder="Type any subject or idea..."
            value={inspirationSubject}
            onChange={(e) => setInspirationSubject(e.target.value)}
          />
        )}
      </Modal>

      {/* User menu dropdown */}
      <div style={{ position: 'absolute', top: '50px', left: '20px' }}>
        <Dropdown menu={{ items: menuItems }} trigger={['click']}>
          <div
            style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}
            onClick={(e) => e.preventDefault()}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                border: '2px solid #666',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '8px'
              }}
            >
              <UserOutlined style={{ fontSize: '18px', color: '#666' }} />
            </div>
            <span style={{ fontFamily: 'Inria Serif', fontSize:'18px', color: '#666' }}>
              Welcome, {userName}!
            </span>
          </div>
        </Dropdown>
      </div>

      {/* CategoryList on the left */}
      <div style={{ marginTop: '88px' }}>
        <CategoryList
          categories={categories}
          notes={notes}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />
      </div>

      {/* Notes grid on the right */}
      <div style={{ flex: 1, position: 'relative', boxSizing: 'border-box' }}>
        <div style={{ position: 'absolute', top: '55px', right: '40px' }}>
          <NewNoteButton onClick={handleCreateNote} />
        </div>

        <div
          style={{
            marginTop: '88px',
            marginLeft: '150px',
            padding: '20px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            position: 'relative',
            minHeight: 'calc(100vh - 88px - 40px)',
          }}
        >
          {filteredNotes.length === 0 ? (
            // Empty state with a nice illustration
            <div
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%) translateX(-150px) translateY(250px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <img
                  src="/cup.png"
                  alt="No notes"
                  style={{
                    width: '300px',
                    height: 'auto',
                  }}
                />
                <div
                  className="label"
                  style={{
                    marginTop: '20px',
                    height: '29px',
                    width: '522px',
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  <div
                    className="text-wrapper"
                    style={{
                      color: '#88632a',
                      fontFamily: '"Inter-Regular", Helvetica',
                      fontSize: '24px',
                      fontWeight: 400,
                      letterSpacing: 0,
                      lineHeight: 'normal',
                      position: 'relative'
                    }}
                  >
                    I’m just here waiting for your charming notes...
                  </div>
                </div>
              </div>
            </div>
          ) : (
            filteredNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onNoteDelete={handleNoteDelete}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
