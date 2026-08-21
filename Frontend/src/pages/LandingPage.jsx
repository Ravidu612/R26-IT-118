import { Activity, BadgeCheck, HeartPulse, Leaf } from 'lucide-react'
import FeatureCard from '../components/landing/FeatureCard'
import LandingHero from '../components/landing/LandingHero'
import LandingInsights from '../components/landing/LandingInsights'
import LandingNavbar from '../components/landing/LandingNavbar'
import LandingWorkflow from '../components/landing/LandingWorkflow'
import StatusCard from '../components/landing/StatusCard'
import { landingFeatures, modelStatuses } from '../constants/landing'

const featureIconMap = { Leaf, BadgeCheck, Activity, HeartPulse }

function LandingPage() {
  return <div className="landing-page min-h-screen bg-[#f7fbf8] text-[#163b29]"><LandingNavbar /><main><LandingHero /><FeatureSection /><LandingInsights /><LandingWorkflow /><SolutionsSection /><LandingFooter /></main></div>
}

function FeatureSection() {
  return <section id="product" className="mx-auto w-full max-w-[1500px] px-5 pt-5 md:px-10"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{landingFeatures.map((feature) => <FeatureCard key={feature.key} title={feature.title} description={feature.description} icon={featureIconMap[feature.icon] || Leaf} />)}</div></section>
}

function SolutionsSection() {
  return <section id="solutions" className="mx-auto mt-12 w-full max-w-[1500px] px-5 md:px-10"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#16764d]">Connected solutions</p><h2 className="mt-2 text-3xl font-extrabold tracking-[-0.05em] text-[#123b28]">Built for every tea operation.</h2></div><p id="resources" className="max-w-md text-sm leading-6 text-[#63806f]">Secure, backend-driven model modules that support estates, factories, supervisors, and field teams.</p></div><div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{modelStatuses.map((model) => <StatusCard key={model.key} title={model.title} status={model.status} description={model.description} />)}</div></section>
}

function LandingFooter() {
  return <footer id="about" className="mt-14 border-t border-[#dcebe0] bg-white"><div className="flex w-full flex-col items-start justify-between gap-2 px-5 py-6 text-xs text-[#6d8977] md:flex-row md:items-center md:px-[5vw]"><p className="font-bold text-[#23613e]">TeaGuard AI | Tea Leaf Intelligence System</p><p>Backend-driven AI integrations for Sri Lankan tea operations.</p></div></footer>
}

export default LandingPage
