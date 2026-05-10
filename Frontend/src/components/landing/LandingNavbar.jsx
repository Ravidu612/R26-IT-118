import { Leaf, LogIn, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../ui/Button'

function LandingNavbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border-color)] bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="rounded-lg bg-emerald-400/20 p-2">
            <Leaf className="h-5 w-5 text-emerald-300" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-emerald-200">TeaGuard AI</p>
            <p className="text-xs text-slate-400">Tea Leaf Intelligence System</p>
          </div>
        </Link>
        <nav className="flex items-center gap-2">
          <Link to="/login">
            <Button icon={LogIn} variant="outline" size="sm">
              Login
            </Button>
          </Link>
          <Link to="/register">
            <Button icon={UserPlus} variant="secondary" size="sm">
              Get Started
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default LandingNavbar
