// services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Change si besoin

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fonction pour définir le token dynamiquement
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Charger le token au démarrage (si déjà connecté)
const storedToken = localStorage.getItem('token');
if (storedToken) {
  setAuthToken(storedToken);
}

// Intercepteur pour gérer les erreurs globalement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Optionnel : gérer 401 (déconnexion)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      setAuthToken(null);
      // window.location.href = '/login'; // Décommente si tu as une page login
    }
    return Promise.reject(error);
  }
);

// ========================
// Fonctions API
// ========================

// Bonus : fonction pour login (si tu en as besoin plus tard)
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  const token = response.data.token;
  if (token) {
    localStorage.setItem('token', token);
    setAuthToken(token);
  }
  return response.data;
};

export default api;