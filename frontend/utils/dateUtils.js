/**
 * Utility functions for date manipulation and formatting in the Notes app.
 */

/**
 * Format a given date string into "Today", "Yesterday", or "MMM DD".
 * 
 * @param {string | null | undefined} dateString - The input date string in ISO format.
 * @returns {string} - The formatted date string.
 */
export function formatDate(dateString) {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()

  const isToday = date.toDateString() === now.toDateString()

  // Check if the date is "yesterday" by comparing to (now - 1 day)
  const yesterday = new Date()
  yesterday.setDate(now.getDate() - 1)
  const isYesterday = date.toDateString() === yesterday.toDateString()

  if (isToday) {
    return 'Today'
  } else if (isYesterday) {
    return 'Yesterday'
  } else {
    // Format date as 'MMM DD' if it's older than yesterday
    const options = { month: 'short', day: 'numeric' }
    return date.toLocaleDateString('en-US', options)
  }
}
