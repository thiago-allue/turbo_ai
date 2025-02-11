export function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()

  const isToday = date.toDateString() === now.toDateString()

  // Check if yesterday
  const yesterday = new Date()
  yesterday.setDate(now.getDate() - 1)
  const isYesterday = date.toDateString() === yesterday.toDateString()

  if (isToday) {
    return 'Today'
  } else if (isYesterday) {
    return 'Yesterday'
  } else {
    // Format as MonthName Day
    const options = { month: 'short', day: 'numeric' }
    return date.toLocaleDateString('en-US', options)
  }
}
