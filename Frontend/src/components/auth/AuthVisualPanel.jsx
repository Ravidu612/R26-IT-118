import { ArrowRight, Leaf, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import TeaGuardLogo from '../brand/TeaGuardLogo'

function AuthVisualPanel({ mode = 'login' }) {
  const isRegister = mode === 'register'
  return <aside className="relative isolate hidden min-h-screen overflow-hidden bg-[#075c3b] lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16"><img src="/assets/sri-lankan-tea-picker.png" alt="Sri Lankan tea picker in a tea estate" className="absolute inset-0 -z-20 h-full w-full object-cover" /><div className="absolute inset-0 -z-10 bg-[#075c3b]/85" /><div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#063d27]/95 via-[#075c3b]/72 to-[#16804e]/55" /><div><Link to="/" className="inline-flex items-center gap-3 text-white"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15"><TeaGuardLogo className="h-9 w-9" /></span><span><strong className="block text-lg tracking-tight">TeaGuard AI</strong><small className="text-xs text-[#c8efd2]">Tea Leaf Intelligence System</small></span></Link><div className="mt-20 max-w-xl"><p className="inline-flex items-center gap-2 rounded-full border border-[#a8ddb5]/50 bg-white/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#d9f5df]"><Leaf className="h-3.5 w-3.5" /> Sri Lankan tea intelligence</p><h2 className="mt-6 text-4xl font-extrabold leading-tight tracking-[-0.05em] text-white xl:text-5xl">{isRegister ? 'Build a smarter tea operation.' : 'Welcome back to your tea intelligence workspace.'}</h2><p className="mt-5 max-w-md text-sm leading-6 text-[#d8f1dd]">{isRegister ? 'Connect your estate, quality team, and field operations with secure AI workflows built for every harvest.' : 'Monitor leaf health, tea grades, worker safety, and operational decisions from one calm workspace.'}</p></div></div><div className="grid gap-3 sm:grid-cols-2"><Feature icon={ShieldCheck} text="Secure backend-driven workflows" /><Feature icon={Sparkles} text={isRegister ? 'Start with a connected workspace' : 'Clear insights for faster action'} /><Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-[#c9efd2] transition hover:text-white">Back to landing page <ArrowRight className="h-4 w-4" /></Link></div></aside>
}

function Feature({ icon: Icon, text }) {
  return <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-[11px] font-semibold text-[#e1f6e6]"><Icon className="h-4 w-4 text-[#b9e9c8]" />{text}</div>
}

export default AuthVisualPanel
