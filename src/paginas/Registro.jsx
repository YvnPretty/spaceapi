import { Link, useNavigate } from 'react-router-dom'
import reactLogo from '../assets/react.svg'
import './paginas.css'

export default function Registro() {
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    const { nombre, email, password } = e.target.elements
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')
    usuarios.push({ nombre: nombre.value, email: email.value, password: password.value })
    localStorage.setItem('usuarios', JSON.stringify(usuarios))
    navigate('/login')
  }

  return (
    <div className="paginas-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <img src={reactLogo} alt="Logo" className="auth-logo" />
          <h1 className="auth-title">Crear cuenta</h1>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input name="nombre" className="form-input" placeholder="Nombre completo" required />
          <input name="email" type="email" className="form-input" placeholder="Correo electrónico" required />
          <input name="password" type="password" className="form-input" placeholder="Contraseña" required />
          <button type="submit" className="btn-auth btn-primary">Registrarse</button>
        </form>

        <div className="auth-footer">
          <Link to="/login" className="auth-link">¿Ya tienes cuenta? Inicia sesión</Link>
          <div>
            <Link to="/" className="nav-home-link">← Volver al inicio</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
