import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import Topbar from './Topbar'
import { NAV_ITEMS } from './Sidebar'
import OnboardingWalkthrough from '../onboarding/OnboardingWalkthrough'
import PageLoader from '../common/PageLoader'
import MicPermissionBanner from '../common/MicPermissionBanner'
import { useMicPermission } from '../../hooks/useMicPermission'

// Settings lives behind a header icon rather than the main nav, but should
// still show as the page title.
const TITLE_ONLY_ITEMS = [{ to: '/settings', label: 'Settings', end: true }]

export default function Layout() {
  const location = useLocation()
  const micStatus = useMicPermission()
  const current = [...NAV_ITEMS, ...TITLE_ONLY_ITEMS].find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  )

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={current?.label || 'SpeakForge'} />
        <MicPermissionBanner status={micStatus} />
        <main className="flex-1 px-4 pb-24 pt-5 md:px-8 md:pb-10 md:pt-6">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <MobileNav />
      <OnboardingWalkthrough />
    </div>
  )
}
