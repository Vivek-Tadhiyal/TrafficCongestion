// src/services/api.js
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

export const getTrafficFlow = async (lat, lon) => {
  // backend expects lat, lon query params
  const { data } = await axios.get(`${API_BASE}/traffic/flow?lat=${lat}&lon=${lon}`);
  return data;
};
