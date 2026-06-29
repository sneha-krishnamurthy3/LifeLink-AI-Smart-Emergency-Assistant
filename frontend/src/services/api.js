import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const message = error.response.data?.detail || error.response.statusText || 'Server error';
      return Promise.reject(new Error(`API Error (${error.response.status}): ${message}`));
    }
    if (error.request) {
      return Promise.reject(new Error('Network error: Unable to reach the server. Please check your connection.'));
    }
    return Promise.reject(new Error(`Request error: ${error.message}`));
  }
);

/**
 * Send an emergency chat message to the AI assistant.
 * @param {string} message - The user's message.
 * @param {Array} history - The conversation history array.
 * @returns {Promise<object>} The AI response data.
 */
export const sendEmergencyMessage = async (message, history = [], location = null) => {
  const response = await apiClient.post('/api/chat', {
    message,
    conversation_history: history,
    location,
  });
  return response.data;
};

/**
 * Fetch blood donors filtered by blood group and location.
 * @param {string} bloodGroup - The blood group to filter by (e.g., "O+", "A-").
 * @param {number} [lat] - User latitude.
 * @param {number} [lng] - User longitude.
 * @param {string} [city] - User city.
 * @returns {Promise<object>} The list of matching donors.
 */
export const getDonors = async (bloodGroup, lat = null, lng = null, city = null) => {
  const params = {};
  if (bloodGroup && bloodGroup !== 'All') params.blood_group = bloodGroup;
  if (lat !== null && lat !== undefined) params.lat = lat;
  if (lng !== null && lng !== undefined) params.lng = lng;
  if (city) params.city = city;

  const response = await apiClient.get('/api/donors', { params });
  return response.data;
};

/**
 * Fetch nearby hospitals based on location.
 * @param {number} [lat] - Latitude coordinate.
 * @param {number} [lng] - Longitude coordinate.
 * @param {string} [city] - Optional city name for fallback search.
 * @returns {Promise<object>} The list of nearby hospitals.
 */
export const getHospitals = async (lat = null, lng = null, city = null) => {
  const params = {};
  if (lat !== null && lat !== undefined) params.lat = lat;
  if (lng !== null && lng !== undefined) params.lng = lng;
  if (city) params.city = city;

  const response = await apiClient.get('/api/hospitals', { params });
  return response.data;
};

/**
 * Check if the backend API is healthy and reachable.
 * @returns {Promise<object>} The health status response.
 */
export const healthCheck = async () => {
  const response = await apiClient.get('/api/health');
  return response.data;
};

/**
 * Register a new blood donor.
 * @param {object} donor - The donor registration payload.
 * @returns {Promise<object>} Success status object.
 */
export const registerDonor = async (donor) => {
  const response = await apiClient.post('/api/donors', donor);
  return response.data;
};

export default apiClient;
