/**
 * NoteCard component displaying a brief preview of a single note.
 * Shows the last edited date, category, truncated content, and a delete icon.
 */

import React, {useState} from 'react'
import {useRouter} from 'next/router'
import {formatDate} from '../utils/dateUtils'
import {DeleteFilled} from '@ant-design/icons'
import api from '../services/api'
import {message, Modal} from 'antd'

const {confirm} = Modal

export default function NoteCard({note, onNoteDelete}) {

  // Next.js router for navigating to the note detail page
  const router = useRouter()

  // Local state to hide the card after deletion
  const [deleted, setDeleted] = useState(false)

  /**
   * If card is marked as deleted, do not render anything.
   */
  if (deleted) {
    return null
  }

  /**
   * Navigates to the note detail page on card click.
   */
  const handleCardClick = () => {
    router.push(`/notes/${note.id}`)
  }

  /**
   * Confirms and deletes the note, then updates UI.
   */
  const handleDelete = (e) => {
    e.stopPropagation()
    confirm({
      title: 'Delete Note',
      content: 'Are you sure you want to delete this note?',
      onOk: async () => {
        try {
          await api.deleteNote(note.id)
          setDeleted(true)
          if (onNoteDelete) {
            onNoteDelete(note.id)
          }
          message.success('Note deleted successfully.')
        } catch (error) {
          console.error(error)
          message.error('Failed to delete note.')
        }
      }
    })
  }

  /**
   * Truncates the given text if it exceeds maxLength, adding ellipses.
   * @param {string} text - The text to truncate.
   * @param {number} maxLength - Maximum length allowed before truncation.
   * @returns {string} - Possibly truncated text.
   */
  const truncateText = (text, maxLength = 100) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  /**
   * Return a color for the note border based on the category name.
   * @param {string} categoryName - e.g. 'random thoughts', 'school', etc.
   * @returns {string} - A suitable border color code.
   */
  const getBorderColor = (categoryName) => {
    if (!categoryName) return '#5a7777'
    const lowerName = categoryName.toLowerCase()
    if (lowerName === 'random thoughts') return '#e07f3e'
    if (lowerName === 'school') return '#dc9e35'
    return '#5a7777'
  }

  // Border color logic
  const borderColor = note.category ? getBorderColor(note.category.name) : '#0000FF'

  return (
    <div
      style={{
        position: 'relative',
        width: '250px',
        height: '250px',
        border: `4px solid ${borderColor}`,
        borderRadius: '8px',
        padding: '10px',
        cursor: 'pointer',
        backgroundColor: note.category?.color || '#fff',
        overflow: 'hidden'
      }}
      onClick={handleCardClick}
    >
      <p style={{fontSize: '0.8rem', margin: 0}}>
        <strong>{formatDate(note.updated_at)}</strong>{'    '}
        {note.category ? note.category.name : 'No Category'}
      </p>

      <h4 style={{margin: '5px 0', fontSize: '1.5rem', fontFamily: 'Inria Serif'}}>
        {note.title || 'Untitled'}
      </h4>

      <p style={{fontSize: '0.9rem', color: '#555', fontFamily: 'Inter'}}>
        {truncateText(note.content, 80)}
      </p>

      <div style={{position: 'absolute', bottom: '10px', right: '10px'}}>
        <DeleteFilled
          style={{color: 'rgb(217,92,92)', fontSize: '20px', cursor: 'pointer'}}
          onClick={handleDelete}
        />
      </div>
    </div>
  )
}
