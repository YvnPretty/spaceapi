import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './paginas/Home'
import Login from './paginas/Login'
import Registro from './paginas/Registro'
import NexusCockpit from './paginas/NexusCockpit'
import Error404 from './paginas/Error404'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cockpit" element={<NexusCockpit />} />
        <Route path="/nexus" element={<NexusCockpit />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
