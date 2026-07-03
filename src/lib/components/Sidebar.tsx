import { Link, useRouterState, useNavigate } from '@tanstack/react-router'
import { LayoutDashboard, Package, MapPin, Users, GitBranch, ClipboardList, Settings, Leaf, LogOut, Warehouse } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/AuthContext'

const navItems = [
  { section: 'Main', items: [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'collector', 'auditor'] },
    { path: '/inventory', label: 'Inventory', icon: Package, roles: ['admin', 'collector', 'auditor'] },
    { path: '/assets', label: 'Assets & Storage', icon: Warehouse, roles: ['admin', 'collector', 'auditor'] },
    { path: '/origins', label: 'Origins', icon: MapPin, roles: ['admin', 'collector'] },
    { path: '/actors', label: 'Actors', icon: Users, roles: ['admin'] },
  ]},
  { section: 'Events', items: [
    { path: '/trace-units', label: 'Trace Units', icon: GitBranch, roles: ['admin', 'collector', 'auditor'] },
    { path: '/audit-log', label: 'Audit Log', icon: ClipboardList, roles: ['admin', 'auditor'] },
  ]},
  { section: 'Admin', items: [
    { path: '/settings', label: 'Settings', icon: Settings, roles: ['admin'] },
  ]},
]

export function Sidebar() {
  const router = useRouterState()
  const currentPath = router.location.pathname
  const { user, role, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate({ to: '/login' })
  }

  const initials = user?.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? '?'

  return (
    <aside className="w-52 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 h-screen sticky top-0">
      <div className="px-4 py-4 border-b border-gray-200 flex items-center gap-2">
        <div className="w-7 h-7 rounded-md bg-emerald-600 flex items-center justify-center">
          <Leaf size={14} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 leading-tight">Tracy</p>
          <p className="text-xs text-gray-500 tracking-wide">by Noovoleum</p>
        </div>
      </div>

      <nav className="flex-1 p-2 overflow-auto">
        {navItems.map((group) => {
          const visibleItems = group.items.filter((item) => !role || item.roles.includes(role))
          if (visibleItems.length === 0) return null
          return (
            <div key={group.section} className="mb-1">
              <p className="text-xs text-gray-400 uppercase tracking-widest px-2 py-1.5">{group.section}</p>
              {visibleItems.map(({ path, label, icon: Icon }) => {
                const active = path === '/' ? currentPath === '/' : currentPath.startsWith(path)
                return (
                  <Link
                    key={path}
                    to={path}
                    className={cn(
                      'flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm mb-0.5 transition-colors',
                      active
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    )}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                )
              })}
            </div>
          )
        })}
      </nav>

      <div className="p-2 border-t border-gray-100">
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-medium text-emerald-700 flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-900 truncate">{user?.name ?? 'Guest'}</p>
            <p className="text-xs text-gray-500 capitalize">{role ?? ''}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
