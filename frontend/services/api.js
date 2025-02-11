import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api/v1/'
})

// Attach token to every request
apiClient.interceptors.request.use(config => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : ''
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

export default {
  register: (data) => apiClient.post('register/', data),
  login: (data) => apiClient.post('login/', data),
  logout: () => apiClient.post('logout/'),
  getNotes: () => apiClient.get('notes/'),
  getNote: (id) => apiClient.get(`notes/${id}/`),
  createNote: (data = {}) => apiClient.post('notes/', data),
  updateNote: (id, data) => apiClient.put(`notes/${id}/`, data),
  deleteNote: (id) => apiClient.delete(`notes/${id}/`),
  getCategories: () => apiClient.get('categories/'),
  updateCategory: (id, data) => apiClient.put(`categories/${id}/`, data),
  getProfile: () => apiClient.get('profile/'),
  updateProfile: (data) => apiClient.put('profile/', data)
}
