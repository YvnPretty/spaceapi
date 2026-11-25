import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import reactLogo from '../assets/react.svg'
import './paginas.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')
    const usuario = usuarios.find((u) => u.email === email && u.password === password)

    if (!usuario) {
      setError('Correo electrónico o contraseña incorrectos')
      return
    }

    localStorage.setItem('usuarioActivo', JSON.stringify(usuario))
    navigate('/')
  }

  return (
    <div className="paginas-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <img src={reactLogo} alt="Logo" className="auth-logo" />
          <h1 className="auth-title">Iniciar sesión</h1>
          <p className="auth-subtitle">Ingresa tus credenciales para acceder</p>
        </div>

        {error && <div className="auth-alert-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email">Correo electrónico</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="nombre@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-auth btn-primary">
              Iniciar sesión
            </button>
            <Link to="/registro" className="btn-auth btn-secondary">
              Registrarse
            </Link>
          </div>
        </form>

        <div className="auth-footer">
          <span>¿No tienes una cuenta?</span>
          <Link to="/registro" className="auth-link">
            Regístrate aquí
          </Link>
          <div>
            <Link to="/" className="nav-home-link">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
