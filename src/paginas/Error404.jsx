import { Link } from 'react-router-dom'
import reactLogo from '../assets/react.svg'
import './paginas.css'

export default function Error404() {
  return (
    <div className="paginas-wrapper">
      <div className="auth-card home-card">
        <div className="auth-header">
          <img src={reactLogo} alt="Logo" className="auth-logo" />
          <h1 className="error-code">404</h1>
          <h2 className="auth-title">Página no encontrada</h2>
          <p className="auth-subtitle">
            La ruta a la que intentas acceder no existe o fue movida.
          </p>
        </div>

        <div className="home-buttons">
          <Link to="/" className="btn-auth btn-primary">
            Volver al inicio
          </Link>
          <Link to="/login" className="btn-auth btn-secondary">
            Ir a Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  )
}
