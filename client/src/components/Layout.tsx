import { Outlet, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Layout() {
  const { user, logout } = useAuth()

  return (
    <>
      <nav className="nav-bar">
        {user ? (
          <>
            <span>{user.name}</span>
            <button onClick={logout}>Log out</button>
          </>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/signup">Sign up</Link>
          </>
        )}
      </nav>
      <img className="banner" src="/assets/logo.jpg" alt="HatRack" />
      <p className="subtitle">Wear your many hats</p>
      <Outlet />
    </>
  )
}
