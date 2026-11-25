import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import './NexusCockpit.css'

const MissionContext = createContext(null)
const NASA_KEY = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY'

const fallbackResearch = [
  {
    id: 1,
    title: 'Análisis de eyección coronal',
    category: 'Heliofísica',
    status: 'En progreso',
    date: '2026-11-24',
    summary: 'Seguimiento comparativo de partículas solares y su posible impacto geomagnético.',
  },
]

const modules = [
  { id: 'overview', label: 'Mission Control', icon: '◉' },
  { id: 'solar', label: 'Solar Monitor', icon: '☼' },
  { id: 'asteroids', label: 'Asteroid Tracker', icon: '◈' },
  { id: 'gallery', label: 'Space Gallery', icon: '▧' },
  { id: 'research', label: 'Research Logs', icon: '≡' },
  { id: 'alerts', label: 'Alert Center', icon: '!' },
]

function useNasaData() {
  const [data, setData] = useState({ solar: [], solarSource: 'NASA DONKI', asteroids: [], apod: null })
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState([])

  useEffect(() => {
    const controller = new AbortController()
    const end = new Date()
    const solarStart = new Date(end)
    solarStart.setDate(end.getDate() - 14)
    const neoStart = new Date(end)
    neoStart.setDate(end.getDate() - 6)
    const iso = (date) => date.toISOString().slice(0, 10)

    async function requestJson(url, label) {
      const response = await fetch(url, { signal: controller.signal })
      if (!response.ok) {
        throw new Error(`${label}: HTTP ${response.status}`)
      }
      return response.json()
    }

    async function load() {
      setLoading(true)
      setErrors([])
      const results = await Promise.allSettled([
        requestJson(
          `https://api.nasa.gov/DONKI/FLR?startDate=${iso(solarStart)}&endDate=${iso(end)}&api_key=${NASA_KEY}`,
          'DONKI',
        ),
        requestJson(
          `https://api.nasa.gov/neo/rest/v1/feed?start_date=${iso(neoStart)}&end_date=${iso(end)}&api_key=${NASA_KEY}`,
          'NeoWs',
        ),
        requestJson(`https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}`, 'APOD'),
      ])

      if (controller.signal.aborted) return

      const [solarResult, neoResult, apodResult] = results
      const failedRequests = results
        .slice(1)
        .filter((result) => result.status === 'rejected')
        .map((result) => {
          const message = result.reason.message || 'Error de conexión'
          return message.includes('HTTP 429')
            ? `${message} (límite de NASA DEMO_KEY; configura VITE_NASA_API_KEY)`
            : message
        })

      let solarData = solarResult.status === 'fulfilled' ? solarResult.value : null
      let solarSource = 'NASA DONKI'

      if (!solarData) {
        try {
          const noaaData = await requestJson(
            'https://services.swpc.noaa.gov/json/goes/primary/xray-flares-7-day.json',
            'NOAA SWPC',
          )
          solarData = noaaData.map((flare) => ({
            flareID: flare.max_time,
            classType: flare.max_class,
            beginTime: flare.begin_time,
            source: 'NOAA SWPC',
          }))
          solarSource = 'NOAA SWPC'
        } catch (err) {
          failedRequests.unshift(solarResult.reason.message || 'DONKI no disponible')
          failedRequests.unshift(err.message || 'NOAA SWPC no disponible')
        }
      }

      setData((current) => ({
        solar: solarData ? solarData.slice(-12).reverse() : current.solar,
        solarSource: solarData ? solarSource : current.solarSource,
        asteroids: neoResult.status === 'fulfilled'
          ? Object.values(neoResult.value.near_earth_objects || {}).flat()
          : current.asteroids,
        apod: apodResult.status === 'fulfilled' ? apodResult.value : current.apod,
      }))
      setErrors(failedRequests)
      setLoading(false)
    }

    load().catch((err) => {
      if (!controller.signal.aborted) {
        setErrors([err.message || 'Error inesperado al consultar NASA'])
        setLoading(false)
      }
    })

    return () => controller.abort()
  }, [])

  return { ...data, loading, errors, error: errors.join('; ') }
}

function Earth() {
  return (
    <div className="earth-wrap" aria-label="Visualización orbital de la Tierra">
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="earth">
        <span className="earth-glow" />
      </div>
    </div>
  )
}

function Header({ setActive }) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  return (
    <header className="nexus-header">
      <button className="mobile-menu" type="button" onClick={() => setActive('overview')}>
        ☰
      </button>
      <Link className="nexus-brand" to="/">
        <span className="brand-mark">NX</span>
        <span>
          <strong>NEXUS</strong>
          <small>SPACE CONTROL</small>
        </span>
      </Link>
      <div className="mission-clock">
        <span>UTC</span>
        <strong>
          {now.toLocaleTimeString('en-GB', { hour12: false, timeZone: 'UTC' })}
        </strong>
      </div>
      <div className="operator">
        <span className="online-dot" />
        <div>
          <strong>CONTROL TEAM</strong>
          <small>ONLINE</small>
        </div>
      </div>
    </header>
  )
}

function Sidebar({ active, setActive }) {
  return (
    <aside className="nexus-sidebar">
      <nav>
        {modules.map((item) => (
          <button
            key={item.id}
            type="button"
            className={active === item.id ? 'active' : ''}
            onClick={() => setActive(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="system-link">
        <span>● SYSTEMS</span>
        <strong>NOMINAL</strong>
      </div>
    </aside>
  )
}

function MetricCard({ label, value, unit, detail, tone = 'blue' }) {
  return (
    <article className={`metric-card tone-${tone}`}>
      <div>
        <span className="metric-label">{label}</span>
        <div className="metric-value">
          {value} <small>{unit}</small>
        </div>
        <span className="metric-detail">{detail}</span>
      </div>
      <span className="metric-pulse" />
    </article>
  )
}

function Overview() {
  const { solar, solarSource, asteroids, apod, loading, error } = useContext(MissionContext)
  const strongSolar = solar.filter((item) => ['M', 'X'].includes(item.classType?.[0])).length
  const hazardous = asteroids.filter((item) => item.is_potentially_hazardous_asteroid).length

  return (
    <div className="dashboard-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">MISSION CONTROL / 01</span>
          <h1>Orbital Operations</h1>
        </div>
        <div className={`sync-status ${error ? 'warning' : ''}`}>
          <span />
          {loading ? 'SYNCHRONIZING' : error ? 'CACHE MODE' : 'LIVE NASA FEED'}
        </div>
      </div>

      {error && <div className="data-notice">No se pudo actualizar algún feed NASA: {error}. Los demás módulos siguen activos.</div>}

      <section className="control-grid">
        <article className="earth-panel panel">
          <div className="panel-head">
            <span>EARTH OBSERVATION</span>
            <strong>LIVE</strong>
          </div>
          <Earth />
          <div className="coordinates">
            <span>LAT 37.7749° N</span>
            <span>LON 122.4194° W</span>
          </div>
        </article>

        <div className="metrics-stack">
          <MetricCard
            label="SOLAR FLARES"
            value={loading ? '—' : solar.length}
            unit={solarSource === 'NOAA SWPC' ? '7D' : '14D'}
            detail={`${strongSolar} eventos M/X · ${solarSource}`}
            tone="orange"
          />
          <MetricCard
            label="NEAR-EARTH OBJECTS"
            value={loading ? '—' : asteroids.length}
            unit="OBJ"
            detail={`${hazardous} bajo vigilancia`}
            tone="cyan"
          />
          <MetricCard label="SYSTEM UPTIME" value="99.8" unit="%" detail="ALL STATIONS NOMINAL" tone="green" />
        </div>

        <article className="apod-panel panel">
          {apod?.url ? (
            <img src={apod.media_type === 'image' ? apod.url : undefined} alt={apod.title || 'NASA Astronomy Picture'} />
          ) : (
            <div className="apod-fallback">NASA<br />APOD</div>
          )}
          <div className="apod-caption">
            <span>ASTRONOMY / TODAY</span>
            <strong>{apod?.title || 'Astronomical Picture of the Day'}</strong>
          </div>
        </article>
      </section>
    </div>
  )
}

function SolarMonitor() {
  const { solar, solarSource, loading, error } = useContext(MissionContext)
  const classes = ['A', 'B', 'C', 'M', 'X']
  const chart = classes.map((letter) => ({
    letter,
    count: solar.filter((item) => item.classType?.startsWith(letter)).length,
  }))
  const max = Math.max(...chart.map((item) => item.count), 1)

  return (
    <div className="dashboard-page">
      <PageHeading eyebrow="HELIOPHYSICS / 02" title="Solar Activity" />
      {error && <div className="data-notice">{error}</div>}
      <section className="two-column">
        <article className="panel solar-chart">
          <PanelTitle title={`FLARE CLASS DISTRIBUTION / ${solarSource}`} />
          {loading ? <Loading /> : (
            <div className="bar-chart">
              {chart.map((item) => (
                <div className="bar-column" key={item.letter}>
                  <div className="bar-track">
                    <span style={{ height: `${Math.max(8, (item.count / max) * 100)}%` }} />
                  </div>
                  <strong>{item.letter}</strong>
                  <small>{item.count}</small>
                </div>
              ))}
            </div>
          )}
        </article>
        <article className="panel event-list">
          <PanelTitle title={`RECENT FLARES / ${solarSource}`} />
          {loading ? <Loading /> : solar.length ? solar.slice(0, 8).map((flare, index) => (
            <div className="event-row" key={flare.flareID || index}>
              <span className={`class-chip ${flare.classType?.[0] === 'X' ? 'danger' : ''}`}>
                {flare.classType || 'FLR'}
              </span>
              <div>
                <strong>{flare.link ? 'DONKI observation' : 'Solar flare'}</strong>
                <small>{flare.beginTime ? new Date(flare.beginTime).toLocaleString() : 'Solar event'}</small>
              </div>
            </div>
          )) : <Empty label="No flares reported in the selected period" />}
        </article>
      </section>
    </div>
  )
}

function AsteroidTracker() {
  const { asteroids, loading, error } = useContext(MissionContext)

  return (
    <div className="dashboard-page">
      <PageHeading eyebrow="PLANETARY DEFENSE / 03" title="Near-Earth Objects" />
      {error && <div className="data-notice">{error}</div>}
      <article className="panel asteroid-table-panel">
        <PanelTitle title="APPROACH REGISTER" />
        {loading ? <Loading /> : asteroids.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Designation</th><th>Diameter</th><th>Velocity</th><th>Miss distance</th><th>Status</th></tr>
              </thead>
              <tbody>
                {asteroids.slice(0, 12).map((asteroid) => {
                  const approach = asteroid.close_approach_data?.[0]
                  const diameter = asteroid.estimated_diameter?.meters
                  return (
                    <tr key={asteroid.id}>
                      <td><strong>{asteroid.name}</strong></td>
                      <td>{diameter ? `${Math.round(diameter.estimated_diameter_min)}–${Math.round(diameter.estimated_diameter_max)} m` : 'Unknown'}</td>
                      <td>{approach ? `${Math.round(Number(approach.relative_velocity.kilometers_per_hour)).toLocaleString()} km/h` : 'Unknown'}</td>
                      <td>{approach ? `${Math.round(Number(approach.miss_distance.kilometers)).toLocaleString()} km` : 'Unknown'}</td>
                      <td>
                        <span className={asteroid.is_potentially_hazardous_asteroid ? 'status-badge hazard' : 'status-badge'}>
                          {asteroid.is_potentially_hazardous_asteroid ? 'MONITOR' : 'CLEAR'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : <Empty label="No near-Earth objects returned" />}
      </article>
    </div>
  )
}

function SpaceGallery() {
  const { apod, loading } = useContext(MissionContext)
  return (
    <div className="dashboard-page">
      <PageHeading eyebrow="DEEP SPACE ARCHIVE / 04" title="Space Gallery" />
      {loading ? <Loading /> : apod ? (
        <article className="gallery-feature panel">
          {apod.media_type === 'image' && <img src={apod.url} alt={apod.title} />}
          <div className="gallery-copy">
            <span>NASA APOD</span>
            <h2>{apod.title}</h2>
            <p>{apod.explanation}</p>
            {apod.copyright && <small>© {apod.copyright}</small>}
          </div>
        </article>
      ) : <Empty label="NASA gallery unavailable" />}
    </div>
  )
}

function ResearchLogs() {
  const [logs, setLogs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('nexus-research')) || fallbackResearch
    } catch {
      return fallbackResearch
    }
  })
  const [editing, setEditing] = useState(null)
  const [draft, setDraft] = useState({ title: '', category: 'Heliofísica', status: 'En progreso', summary: '' })

  useEffect(() => localStorage.setItem('nexus-research', JSON.stringify(logs)), [logs])

  const openCreate = () => {
    setEditing('new')
    setDraft({ title: '', category: 'Heliofísica', status: 'En progreso', summary: '' })
  }

  const openEdit = (log) => {
    setEditing(log.id)
    setDraft({ title: log.title, category: log.category, status: log.status, summary: log.summary })
  }

  const save = (event) => {
    event.preventDefault()
    if (editing === 'new') {
      setLogs((current) => [
        {
          id: Date.now(),
          ...draft,
          date: new Date().toISOString().slice(0, 10),
        },
        ...current,
      ])
    } else {
      setLogs((current) => current.map((log) => (log.id === editing ? { ...log, ...draft } : log)))
    }
    setEditing(null)
  }

  const remove = (id) => setLogs((current) => current.filter((log) => log.id !== id))

  return (
    <div className="dashboard-page">
      <PageHeading eyebrow="SCIENTIFIC OPERATIONS / 05" title="Research Logs">
        <button type="button" className="primary-action" onClick={openCreate}>+ New investigation</button>
      </PageHeading>
      <section className="research-grid">
        {logs.map((log) => (
          <article className="panel research-card" key={log.id}>
            <div className="research-meta">
              <span>{log.category}</span>
              <span className="status-badge">{log.status}</span>
            </div>
            <h2>{log.title}</h2>
            <p>{log.summary}</p>
            <div className="research-footer">
              <small>{log.date}</small>
              <div>
                <button type="button" onClick={() => openEdit(log)}>Edit</button>
                <button type="button" className="danger-link" onClick={() => remove(log.id)}>Delete</button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {editing !== null && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setEditing(null)}>
          <form className="research-modal" onSubmit={save} onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-title-row">
              <h2>{editing === 'new' ? 'New investigation' : 'Edit investigation'}</h2>
              <button type="button" onClick={() => setEditing(null)}>×</button>
            </div>
            <label>Title<input required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label>
            <div className="modal-fields">
              <label>Category<select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}>
                <option>Heliofísica</option><option>Astrodinámica</option><option>Astrobiología</option><option>Observación</option>
              </select></label>
              <label>Status<select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value })}>
                <option>En progreso</option><option>Completada</option><option>Revisión</option>
              </select></label>
            </div>
            <label>Summary<textarea required rows="5" value={draft.summary} onChange={(event) => setDraft({ ...draft, summary: event.target.value })} /></label>
            <button type="submit" className="primary-action">Save record</button>
          </form>
        </div>
      )}
    </div>
  )
}

function AlertCenter() {
  const { solar, asteroids, loading } = useContext(MissionContext)
  const alerts = useMemo(() => {
    const result = []
    solar.slice(0, 4).forEach((flare) => result.push({
      level: ['X', 'M'].includes(flare.classType?.[0]) ? 'high' : 'medium',
      title: `${flare.classType || 'Solar'} flare detected`,
      detail: `${flare.beginTime ? new Date(flare.beginTime).toLocaleString() : 'Solar alert'} · ${flare.source || 'NASA DONKI'}`,
    }))
    asteroids.filter((item) => item.is_potentially_hazardous_asteroid).slice(0, 3).forEach((asteroid) => {
      result.push({ level: 'high', title: `Object under surveillance: ${asteroid.name}`, detail: 'Potentially hazardous NEO classification' })
    })
    if (!result.length) result.push({ level: 'low', title: 'No critical events', detail: 'All monitored systems remain nominal' })
    return result
  }, [solar, asteroids])

  return (
    <div className="dashboard-page">
      <PageHeading eyebrow="EVENT RESPONSE / 06" title="Alert Center" />
      {loading ? <Loading /> : (
        <section className="alert-list">
          {alerts.map((alert, index) => (
            <article className={`alert-row ${alert.level}`} key={`${alert.title}-${index}`}>
              <div className="alert-symbol">{alert.level === 'high' ? '!' : alert.level === 'medium' ? '▲' : '✓'}</div>
              <div><strong>{alert.title}</strong><small>{alert.detail}</small></div>
              <span>{alert.level.toUpperCase()}</span>
            </article>
          ))}
        </section>
      )}
    </div>
  )
}

function PageHeading({ eyebrow, title, children }) {
  return (
    <div className="page-heading">
      <div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1></div>
      {children}
    </div>
  )
}

function PanelTitle({ title }) {
  return <div className="panel-title"><span>{title}</span><span className="panel-live">● LIVE</span></div>
}

function Loading() {
  return <div className="loading-state"><span /><p>Synchronizing mission data</p></div>
}

function Empty({ label }) {
  return <div className="empty-state">{label}</div>
}

export default function NexusCockpit() {
  const nasa = useNasaData()
  const [active, setActive] = useState('overview')

  const content = {
    overview: <Overview />,
    solar: <SolarMonitor />,
    asteroids: <AsteroidTracker />,
    gallery: <SpaceGallery />,
    research: <ResearchLogs />,
    alerts: <AlertCenter />,
  }[active]

  return (
    <MissionContext.Provider value={nasa}>
      <div className="nexus-app">
        <Header active={active} setActive={setActive} />
        <Sidebar active={active} setActive={setActive} />
        <main className="nexus-main">{content}</main>
      </div>
    </MissionContext.Provider>
  )
}
