import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './components/backend/context/Auth.jsx'

import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher;

window.Echo = new Echo({
  broadcaster: 'pusher',
  key: import.meta.env.VITE_PUSHER_APP_KEY,
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
  forceTLS: true  
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    
    <AuthProvider>
      <App />
    </AuthProvider>

  </StrictMode>,
)
