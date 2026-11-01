import axios from 'axios';

// Assume backend is running on 8000
// Use 127.0.0.1 instead of localhost for reliability across IPv4/IPv6
const API_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_URL,
});

export default api;
