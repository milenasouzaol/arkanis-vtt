import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import ProtectedRoute from './lib/ProtectedRoute'
import Navbar from './components/Navbar'
import AvisoErroBanco from './components/AvisoErroBanco'
import Home from './pages/Home'
import Login from './pages/Login'
import Perfil from './pages/Perfil'
import EditarPerfil from './pages/EditarPerfil'
import Jogar from './pages/Jogar'
import SystemSelect from './pages/SystemSelect'
import CharacterCreate from './pages/CharacterCreate'
import CharacterSheet from './pages/CharacterSheet'
import EntrarCampanha from './pages/EntrarCampanha'
import Mesa from './pages/Mesa'
import CriarCampanha from './pages/CriarCampanha'
import { tocarSom } from './lib/sons'

// Marcar/desmarcar qualquer caixinha do site faz o som de "check" (pedido da Millie, 06/10).
document.addEventListener('change', (e) => {
  const t = e.target
  if (t instanceof HTMLInputElement && t.type === 'checkbox') tocarSom('check')
}, true)

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
          <Route path="/perfil/editar" element={<ProtectedRoute><EditarPerfil /></ProtectedRoute>} />
          <Route path="/jogar" element={<ProtectedRoute><Jogar /></ProtectedRoute>} />
          <Route path="/campanha/criar" element={<ProtectedRoute><CriarCampanha /></ProtectedRoute>} />
          <Route path="/campanha/entrar/:code" element={<ProtectedRoute><EntrarCampanha /></ProtectedRoute>} />
          <Route path="/mesa/:id" element={<ProtectedRoute><Mesa /></ProtectedRoute>} />
          <Route path="/personagem/criar" element={<ProtectedRoute><SystemSelect /></ProtectedRoute>} />
          <Route path="/personagem/criar/:system" element={<ProtectedRoute><CharacterCreate /></ProtectedRoute>} />
          <Route path="/personagem/:id" element={<ProtectedRoute><CharacterSheet /></ProtectedRoute>} />
        </Routes>
        <AvisoErroBanco />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
