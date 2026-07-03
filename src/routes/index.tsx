import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router'
import { Layout } from '@/lib/components/Layout'
import { Dashboard } from '@/pages/Dashboard'
import { Inventory } from '@/pages/Inventory'
import { Origins } from '@/pages/Origins'
import { OriginDetail } from '@/pages/OriginDetail'
import { Actors } from '@/pages/Actors'
import { TraceUnitDetail } from '@/pages/TraceUnitDetail'
import { AuditLog } from '@/pages/AuditLog'
import { Settings } from '@/pages/Settings'
import { Login } from '@/pages/Login'
import { Assets } from '@/pages/Assets'
import { CreateTraceUnit } from '@/pages/CreateTraceUnit'
import { Lineage } from '@/pages/Lineage'
import { CreateOrigin } from '@/pages/CreateOrigin'
import { CreateAsset } from '@/pages/CreateAsset'

const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: '/login', component: Login })

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'app',
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
})

const dashboardRoute = createRoute({ getParentRoute: () => appRoute, path: '/', component: Dashboard })
const inventoryRoute = createRoute({ getParentRoute: () => appRoute, path: '/inventory', component: Inventory })
const createTURoute = createRoute({ getParentRoute: () => appRoute, path: '/trace-units/new', component: CreateTraceUnit })
const originsRoute = createRoute({ getParentRoute: () => appRoute, path: '/origins', component: Origins })
const createOriginRoute = createRoute({ getParentRoute: () => appRoute, path: '/origins/new', component: CreateOrigin })
const originDetailRoute = createRoute({ getParentRoute: () => appRoute, path: '/origins/$id', component: OriginDetail })
const actorsRoute = createRoute({ getParentRoute: () => appRoute, path: '/actors', component: Actors })
const assetsRoute = createRoute({ getParentRoute: () => appRoute, path: '/assets', component: Assets })
const createAssetRoute = createRoute({ getParentRoute: () => appRoute, path: '/assets/new', component: CreateAsset })
const traceUnitsRoute = createRoute({ getParentRoute: () => appRoute, path: '/trace-units', component: Inventory })
const traceUnitDetailRoute = createRoute({ getParentRoute: () => appRoute, path: '/trace-units/$id', component: TraceUnitDetail })
const lineageRoute = createRoute({ getParentRoute: () => appRoute, path: '/trace-units/$id/lineage', component: Lineage })
const auditLogRoute = createRoute({ getParentRoute: () => appRoute, path: '/audit-log', component: AuditLog })
const settingsRoute = createRoute({ getParentRoute: () => appRoute, path: '/settings', component: Settings })

const routeTree = rootRoute.addChildren([
  loginRoute,
  appRoute.addChildren([
    dashboardRoute,
    inventoryRoute,
    createTURoute,
    originsRoute,
    createOriginRoute,
    originDetailRoute,
    actorsRoute,
    assetsRoute,
    createAssetRoute,
    traceUnitsRoute,
    traceUnitDetailRoute,
    lineageRoute,
    auditLogRoute,
    settingsRoute,
  ]),
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
