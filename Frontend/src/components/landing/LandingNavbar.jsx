import { ArrowRight, LogIn, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../ui/Button'
import TeaGuardLogo from '../brand/TeaGuardLogo'

const links = [['Product', '#product'], ['Solutions', '#solutions'], ['How It Works', '#how-it-works'], ['Benefits', '#benefits'], ['Resources', '#resources'], ['About', '#about']]

function LandingNavbar() {
  return <header className="sticky top-0 z-30 border-b border-[#dcebe0] bg-white/95 backdrop-blur"><div className="flex w-full items-center justify-between px-5 py-3 md:px-[5vw]"><Link to="/" className="inline-flex shrink-0 items-center gap-2.5"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e6f5ea]"><TeaGuardLogo className="h-8 w-8" /></div><div><p className="text-sm font-extrabold tracking-wide text-[#17623e]">TeaGuard AI</p><p className="text-[10px] text-[#799284]">Tea Leaf Intelligence System</p></div></Link><nav className="hidden items-center gap-7 lg:flex">{links.map(([label, href]) => <a key={label} href={href} className="text-[11px] font-bold text-[#4f6a5a] transition hover:text-[#16764d]">{label}</a>)}</nav><nav className="flex items-center gap-2"><Link to="/login"><Button icon={LogIn} variant="outline" size="sm" className="border-[#a8cdb3] !bg-white !text-[#166342] hover:!bg-[#f0f8f2]">Log in</Button></Link><Link to="/register"><Button icon={UserPlus} size="sm" className="hidden sm:inline-flex">Get Started <ArrowRight className="h-3.5 w-3.5" /></Button><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#16764d] text-white sm:hidden"><ArrowRight className="h-4 w-4" /></span></Link></nav></div></header>
}

export default LandingNavbar
