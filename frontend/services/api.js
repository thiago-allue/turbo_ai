/**
 * Provides a centralized API client for the frontend using Axios.
 * Automatically attaches the user's token (if any) to requests.
 */

import axios from 'axios'

/**
 * Create a pre-configured Axios instance with the base API URL.
 */
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api/v1/'
})

/**
 * Intercept every request to attach the user's token for authentication (if available).
 */
apiClient.interceptors.request.use(config => {

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : ''

  if (token) {
    config.headers.Authorization = `Token ${token}`
  }

  return config
}, error => {
  return Promise.reject(error)
})

/**
 * Expose a set of helper functions to interact with our backend API.
 */
export default {

  /**
   * Register a new user.
   * @param {Object} data - The signup data (e.g., first_name, last_name, username, password).
   * @returns {Promise} Axios response promise.
   */
  register: (data) => apiClient.post('register/', data),

  /**
   * Login a user.
   * @param {Object} data - The login data (username, password).
   * @returns {Promise} Axios response promise.
   */
  login: (data) => apiClient.post('login/', data),

  /**
   * Logout the current user.
   * @returns {Promise} Axios response promise.
   */
  logout: () => apiClient.post('logout/'),

  /**
   * Retrieve all notes belonging to the logged-in user.
   * @returns {Promise} Axios response promise.
   */
  getNotes: () => apiClient.get('notes/'),

  /**
   * Retrieve a specific note by ID.
   * @param {number|string} id - The note ID.
   * @returns {Promise} Axios response promise.
   */
  getNote: (id) => apiClient.get(`notes/${id}/`),

  /**
   * Create a new note.
   * @param {Object} data - The note data (title, content, category_id, etc.).
   * @returns {Promise} Axios response promise.
   */
  createNote: (data = {}) => apiClient.post('notes/', data),

  /**
   * Update an existing note.
   * @param {number|string} id - The note ID to update.
   * @param {Object} data - The updated fields.
   * @returns {Promise} Axios response promise.
   */
  updateNote: (id, data) => apiClient.put(`notes/${id}/`, data),

  /**
   * Delete a note by ID.
   * @param {number|string} id - The note ID to delete.
   * @returns {Promise} Axios response promise.
   */
  deleteNote: (id) => apiClient.delete(`notes/${id}/`),

  /**
   * Retrieve all categories belonging to the logged-in user.
   * @returns {Promise} Axios response promise.
   */
  getCategories: () => apiClient.get('categories/'),

  /**
   * Update a category by ID.
   * @param {number|string} id - The category ID.
   * @param {Object} data - The updated fields.
   * @returns {Promise} Axios response promise.
   */
  updateCategory: (id, data) => apiClient.put(`categories/${id}/`, data),

  /**
   * Fetch the profile of the logged-in user.
   * @returns {Promise} Axios response promise.
   */
  getProfile: () => apiClient.get('profile/'),

  /**
   * Update the profile of the logged-in user.
   * @param {Object} data - The fields to update (first_name, last_name, etc.).
   * @returns {Promise} Axios response promise.
   */
  updateProfile: (data) => apiClient.put('profile/', data)
}
