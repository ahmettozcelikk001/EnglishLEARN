import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Giriş yapmış kullanıcı için ortak kabuk: üst gezinme + içerik alanı.
const navItems = [
  { to: '/', label: 'Panel', end: true },
  { to: '/flashcards', label: 'Kartlar' },
  { to: '/review', label: 'Tekrar' },
  { to: '/materials', label: 'Materyaller' },
  { to: '/quiz', label: 'Quiz' },
]

export default function Layout() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex items-center justify-between h-14">
            <span className="font-bold text-slate-900">İngilizce</span>
            <button
              onClick={signOut}
              className="text-sm text-slate-500 hover:text-slate-800"
              title={user?.email}
            >
              Çıkış
            </button>
          </div>
          {/* Gezinme — mobilde yatay kaydırılabilir */}
          <nav className="flex gap-1 overflow-x-auto -mb-px">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `whitespace-nowrap px-3 py-2.5 text-sm font-medium border-b-2 transition ${
                    isActive
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
