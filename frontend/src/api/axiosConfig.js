import axios from 'axios';
import { API_URL } from '../constants';

// Create an Axios instance with custom configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for handling cookies/sessions
});

export default api;