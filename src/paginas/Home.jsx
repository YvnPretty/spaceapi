import { useState } from 'react'
import { Link } from 'react-router-dom'
import './paginas.css'

export default function Home() {
  const [usuario, setUsuario] = useState(() => {
    const sesion = localStorage.getItem('usuarioActivo')
    return sesion ? JSON.parse(sesion) : null
  })

  const cerrarSesion = () => {
    localStorage.removeItem('usuarioActivo')
    setUsuario(null)
  }

  return (
    <div className="paginas-wrapper">
      <div className="auth-card home-card">
        <div className="auth-header">
          <div className="brand-mark" style={{ margin: '0 auto 12px' }}>NX</div>
          <h1 className="auth-title">
            {usuario ? `¡Hola, ${usuario.nombre}!` : 'Bienvenido'}
          </h1>
          <p className="auth-subtitle">
            {usuario
              ? `Sesión activa con ${usuario.email}`
              : 'Accede a NEXUS SPACE'}
          </p>
        </div>

        <div className="home-buttons">
          <Link
            to="/cockpit"
            className="btn-auth btn-primary"
            style={{ background: 'linear-gradient(135deg, #12304d 0%, #1d5d90 100%)', borderColor: '#58a8ff', color: '#fff' }}
          >
            <span>Entrar a Mission Control</span>
          </Link>

          {usuario ? (
            <button
              type="button"
              className="btn-auth btn-secondary"
              onClick={cerrarSesion}
            >
              Cerrar sesión
            </button>
          ) : (
            <>
              <Link to="/login" className="btn-auth btn-primary">
                Iniciar sesión
              </Link>
              <Link to="/registro" className="btn-auth btn-secondary">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
