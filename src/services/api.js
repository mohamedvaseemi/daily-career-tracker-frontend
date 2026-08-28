import axios from 'axios'

// Production-la Vercel env variable use pannum, local-la localhost:8080 fallback aagum
const apiClient = axios.create({
  baseURL: "https://daily-career-tracker-backend.onrender.com/api" || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
})

export default {
  sendOtp: () => apiClient.post('/auth/send-otp'),
  verifyOtp: (otp) => apiClient.post('/auth/verify-otp', { otp }),
  getDailyNotes: () => apiClient.get('/notes'),
  createDailyNote: (data) => apiClient.post('/notes', data),
  deleteDailyNote: (id) => apiClient.delete(`/notes/${id}`)
}